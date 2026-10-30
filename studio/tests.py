from django.test import Client, TestCase
from django.db import IntegrityError, transaction
from django.test.utils import override_settings
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from pathlib import Path
import base64
import json
import struct
import tempfile
import zlib
from .models import Artwork, Lesson, LessonStep
class StudioTests(TestCase):
    def test_home_has_studio_and_no_upload_form(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Little Artist')
        self.assertContains(response, 'id="paint"')
        self.assertNotContains(response, 'multipart/form-data')
    def test_no_artwork_upload_endpoint(self):
        self.assertEqual(self.client.post('/').status_code, 405)
    def test_steps_are_ordered_and_unique(self):
        lesson = Lesson.objects.create(slug='cat', title='Cat', difficulty='explore')
        LessonStep.objects.create(lesson=lesson, order=2, instruction='Ears')
        LessonStep.objects.create(lesson=lesson, order=1, instruction='Head')
        self.assertEqual(list(lesson.steps.values_list('order',flat=True)), [1,2])
        with self.assertRaises(IntegrityError), transaction.atomic():
            LessonStep.objects.create(lesson=lesson, order=1, instruction='Duplicate')

    def test_paper_lessons_are_primary_and_studio_is_optional(self):
        response = self.client.get('/')
        self.assertContains(response, 'ages 4–12')
        self.assertContains(response, 'id="learner-age"')
        self.assertContains(response, '<option value="4">4 years</option>', html=True)
        self.assertContains(response, '<option value="12">12 years</option>', html=True)
        self.assertContains(response, 'id="digital-studio" hidden')
        self.assertContains(response, 'id="next-step"')

    def test_about_me_page_uses_a_local_only_artist_card(self):
        response = self.client.get('/about/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'My artist card')
        self.assertContains(response, 'This card stays on this device')
        self.assertContains(response, 'studio/about.js')

    def test_ishan_and_granny_have_a_dedicated_story_page(self):
        response = self.client.get('/our-story/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Meet Little Ishan')
        self.assertContains(response, 'his Granny')
        self.assertContains(response, 'How a Kitchen Table Became an Art School')
        self.assertContains(response, 'Granny’s 3 Golden Rules')
        self.assertContains(response, 'studio/story.css')
        self.assertContains(response, 'studio/assets/ishan-granny.jpg')

    def test_home_links_to_ishan_and_granny_story(self):
        self.assertContains(self.client.get('/'), 'id="story-button"')
        self.assertContains(self.client.get('/'), '/our-story/')

    def test_online_story_link_is_not_duplicated_in_main_menu(self):
        response = self.client.get('/')
        self.assertContains(response, 'id="story-button"')
        self.assertNotContains(response, 'Ishan &amp; Granny</a>')

    def test_install_manifest_has_standalone_icons(self):
        response = self.client.get('/manifest.webmanifest')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['display'], 'standalone')
        self.assertEqual(data['scope'], '/')
        self.assertEqual({icon['sizes'] for icon in data['icons']}, {'192x192', '512x512'})

    def test_offline_worker_is_root_scoped_and_excludes_admin(self):
        response = self.client.get('/service-worker.js')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Service-Worker-Allowed'], '/')
        self.assertEqual(response['Cache-Control'], 'no-cache')
        self.assertContains(response, "request.method !== 'GET'")
        self.assertNotContains(response, '/admin/')

    def test_every_precached_asset_exists(self):
        import re
        from pathlib import Path
        from django.conf import settings
        root = settings.BASE_DIR / 'studio' / 'static'
        source = (root / 'studio' / 'service-worker.js').read_text()
        assets = re.findall(r'at\("([^"]+)"\)', source)
        self.assertTrue(assets)
        for asset in assets:
            if asset.startswith('static/'):
                self.assertTrue((root / asset.removeprefix('static/')).is_file(), asset)


class OnlineSketchbookTests(TestCase):
    password = 'Pencil!Garden-Cloud-427'

    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        override = override_settings(MEDIA_ROOT=Path(temp.name))
        override.enable()
        self.addCleanup(override.disable)

    @staticmethod
    def png_bytes():
        def chunk(kind, payload):
            return struct.pack('>I', len(payload)) + kind + payload + struct.pack('>I', zlib.crc32(kind + payload) & 0xffffffff)
        ihdr = struct.pack('>IIBBBBB', 800, 560, 8, 6, 0, 0, 0)
        row = b'\x00' + (b'\xff\xff\xff\xff' * 800)
        return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(row * 560)) + chunk(b'IEND', b'')

    def png_data_url(self):
        return 'data:image/png;base64,' + base64.b64encode(self.png_bytes()).decode('ascii')

    def create_account(self, username):
        return get_user_model().objects.create_user(username=username, password=self.password)

    def payload(self):
        return {'title': 'Happy Cat', 'png': self.png_data_url(), 'state': {'mode': 'draw', 'subject': 'cat', 'step': 0, 'fills': []}}

    def test_guest_can_keep_using_the_site_without_an_account(self):
        self.assertEqual(self.client.get('/').status_code, 200)
        self.assertEqual(self.client.get('/api/artworks/').status_code, 401)

    def test_guardian_must_confirm_to_create_optional_account(self):
        data = {'username': 'littleartist', 'password1': self.password, 'password2': self.password}
        response = self.client.post('/accounts/signup/', data)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(get_user_model().objects.filter(username='littleartist').exists())
        data['guardian_confirm'] = 'on'
        response = self.client.post('/accounts/signup/', data)
        self.assertRedirects(response, '/')
        self.assertTrue(get_user_model().objects.filter(username='littleartist', email='').exists())

    def test_sign_in_and_sign_out_keep_the_site_optional_and_private(self):
        user = self.create_account('artist-login')
        self.assertEqual(self.client.get('/').status_code, 200)
        response = self.client.post('/accounts/login/', {'username': user.username, 'password': self.password})
        self.assertRedirects(response, '/')
        home = self.client.get('/')
        self.assertEqual(home['Cache-Control'], 'private, no-store')
        self.assertContains(home, 'Online sketchbook')
        self.assertEqual(self.client.get('/api/artworks/')['Cache-Control'], 'private, no-store')
        self.assertRedirects(self.client.post('/accounts/logout/'), '/')
        self.assertEqual(self.client.get('/').wsgi_request.user.is_authenticated, False)

    def test_artwork_mutations_require_csrf_tokens(self):
        user = self.create_account('artist-csrf')
        client = Client(enforce_csrf_checks=True)
        client.force_login(user)
        payload = json.dumps(self.payload())
        self.assertEqual(client.post('/api/artworks/', payload, content_type='application/json').status_code, 403)
        page = client.get('/')
        token = page.cookies['csrftoken'].value
        saved = client.post('/api/artworks/', payload, content_type='application/json', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(saved.status_code, 201)
        artwork_id = saved.json()['id']
        self.assertEqual(client.delete(f'/api/artworks/{artwork_id}/').status_code, 403)
        deleted = client.delete(f'/api/artworks/{artwork_id}/', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(deleted.status_code, 200)

    def test_private_png_save_download_delete_and_owner_isolation(self):
        owner = self.create_account('artist-one')
        self.client.force_login(owner)
        saved = self.client.post('/api/artworks/', data=json.dumps(self.payload()), content_type='application/json')
        self.assertEqual(saved.status_code, 201)
        artwork_id = saved.json()['id']
        item = Artwork.objects.get(pk=artwork_id)
        self.assertEqual(item.image.open('rb').read(), self.png_bytes())
        self.assertFalse(str(item.image.path).startswith('/var/www/'))
        self.assertEqual(self.client.get('/api/artworks/').json()['count'], 1)
        self.assertEqual(self.client.get(f'/api/artworks/{artwork_id}/').json()['state']['subject'], 'cat')
        download = self.client.get(f'/api/artworks/{artwork_id}/download/')
        self.assertEqual(download['Content-Type'], 'image/png')
        self.assertIn('attachment', download['Content-Disposition'])
        self.client.logout()
        other = self.create_account('artist-two')
        self.client.force_login(other)
        self.assertEqual(self.client.get(f'/api/artworks/{artwork_id}/').status_code, 404)
        self.assertEqual(self.client.delete(f'/api/artworks/{artwork_id}/').status_code, 404)
        self.client.logout()
        self.client.force_login(owner)
        self.assertEqual(self.client.delete(f'/api/artworks/{artwork_id}/').status_code, 200)
        self.assertFalse(Artwork.objects.filter(pk=artwork_id).exists())

    def test_server_enforces_thirty_saved_drawings(self):
        owner = self.create_account('artist-limit')
        png = self.png_bytes()
        for number in range(30):
            artwork = Artwork(owner=owner, title=f'Drawing {number}', mode='draw', subject='cat')
            artwork.image.save(f'{number}.png', ContentFile(png), save=True)
        self.client.force_login(owner)
        response = self.client.post('/api/artworks/', data=json.dumps(self.payload()), content_type='application/json')
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()['count'], 30)
        self.assertEqual(Artwork.objects.filter(owner=owner).count(), 30)
