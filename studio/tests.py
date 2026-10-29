from django.test import TestCase
from django.db import IntegrityError, transaction
from .models import Lesson, LessonStep
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
