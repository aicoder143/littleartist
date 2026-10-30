import base64
import binascii
import json
import re
from pathlib import Path
from django.conf import settings
from django.contrib.auth import get_user_model, login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.core.files.base import ContentFile
from django.http import FileResponse, JsonResponse, HttpResponse
from django.db.models import F
from django.shortcuts import render, redirect
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from .models import Artwork

ARTWORK_LIMIT = 30
PNG_LIMIT = 2 * 1024 * 1024
PNG_SIGNATURE = b'\x89PNG\r\n\x1a\n'

@require_GET
def home(request):
    response = render(request, 'studio/index.html', {'artwork_limit': ARTWORK_LIMIT})
    if request.user.is_authenticated:
        response['Cache-Control'] = 'private, no-store'
    return response

@require_GET
def about(request):
    return render(request, 'studio/about.html')

@require_GET
def story(request):
    return render(request, 'studio/story.html')

class GuardianCreationForm(UserCreationForm):
    """No email or child profile is collected; a grown-up creates the login."""
    def clean(self):
        data = super().clean()
        if not data.get('guardian_confirm'):
            self.add_error('guardian_confirm', 'A parent or guardian must create this account.')
        return data

    def __init__(self, *args, **kwargs):
        from django import forms
        super().__init__(*args, **kwargs)
        self.fields['guardian_confirm'] = forms.BooleanField(required=True, label='I am the parent or guardian creating this account.')

@never_cache
def signup(request):
    if request.user.is_authenticated:
        return redirect('home')
    form = GuardianCreationForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = form.save()
        login(request, user)
        return redirect('home')
    return render(request, 'studio/account.html', {'form': form, 'page': 'signup'})

@never_cache
def account_login(request):
    if request.user.is_authenticated:
        return redirect('home')
    form = AuthenticationForm(request, data=request.POST or None)
    if request.method == 'POST' and form.is_valid():
        login(request, form.get_user())
        destination = request.POST.get('next') or request.GET.get('next') or '/'
        if not url_has_allowed_host_and_scheme(destination, {request.get_host()}, require_https=request.is_secure()):
            destination = '/'
        return redirect(destination)
    return render(request, 'studio/account.html', {'form': form, 'page': 'login'})

@require_POST
def account_logout(request):
    logout(request)
    return redirect('home')

def private_json(payload, status=200):
    response = JsonResponse(payload, status=status)
    response['Cache-Control'] = 'private, no-store'
    return response

def api_error(message, status=400, **extra):
    return private_json({'error': message, **extra}, status=status)

def parse_png(data_url):
    if not isinstance(data_url, str) or not data_url.startswith('data:image/png;base64,'):
        raise ValueError('Please save the drawing as a PNG image.')
    try:
        raw = base64.b64decode(data_url.split(',', 1)[1], validate=True)
    except (binascii.Error, ValueError):
        raise ValueError('The drawing image could not be read.')
    if len(raw) > PNG_LIMIT:
        raise ValueError('This PNG is too large. Try simplifying the drawing and save again.')
    if len(raw) < 24 or raw[:8] != PNG_SIGNATURE or raw[12:16] != b'IHDR':
        raise ValueError('Only valid PNG drawings can be saved.')
    width = int.from_bytes(raw[16:20], 'big')
    height = int.from_bytes(raw[20:24], 'big')
    if (width, height) != (800, 560):
        raise ValueError('The drawing image has an unexpected size. Refresh the page and try again.')
    return raw

def authenticated_api(request):
    return request.user.is_authenticated

@require_http_methods(['GET', 'POST'])
def artwork_collection(request):
    if not authenticated_api(request):
        return api_error('Sign in to use your online sketchbook.', 401)
    if request.method == 'GET':
        items = Artwork.objects.filter(owner=request.user)
        return private_json({'artworks': [{
            'id': str(item.id), 'title': item.title, 'mode': item.mode,
            'subject': item.subject, 'created': item.created_at.isoformat(),
            'image': f'/api/artworks/{item.id}/image/',
            'download': f'/api/artworks/{item.id}/download/',
        } for item in items], 'count': items.count(), 'limit': ARTWORK_LIMIT})

    try:
        payload = json.loads(request.body)
        raw = parse_png(payload.get('png'))
        state = payload.get('state', {})
        mode = state.get('mode')
        subject = state.get('subject')
        step = state.get('step', 0)
        if mode not in {'draw', 'lesson', 'color'} or subject not in {'cat', 'flower', 'rocket'}:
            return api_error('This drawing has an unknown type. Please refresh and try again.')
        if not isinstance(step, int) or isinstance(step, bool) or not 0 <= step <= 3:
            return api_error('This drawing step is invalid.')
        fills = state.get('fills', [])
        if not isinstance(fills, list) or len(fills) > 100 or any(not isinstance(x, str) or not re.fullmatch(r'(?:white|#[0-9a-fA-F]{6})', x) for x in fills):
            return api_error('The coloring information is invalid.')
        title = str(payload.get('title') or 'My little drawing').strip()[:80] or 'My little drawing'
    except (json.JSONDecodeError, AttributeError, TypeError, ValueError) as exc:
        return api_error(str(exc) if isinstance(exc, ValueError) else 'The drawing could not be read.')

    from django.db import transaction
    with transaction.atomic():
        # Locking the account serializes simultaneous saves on databases that support row locks.
        user_model = get_user_model()
        user_model.objects.select_for_update().get(pk=request.user.pk)
        # SQLite ignores select_for_update; this no-op update takes its write lock before counting.
        user_model.objects.filter(pk=request.user.pk).update(last_login=F('last_login'))
        current = Artwork.objects.filter(owner=request.user).count()
        if current >= ARTWORK_LIMIT:
            return api_error('Your online sketchbook is full.', 409, code='artwork_limit', count=current, limit=ARTWORK_LIMIT)
        item = Artwork(owner=request.user, title=title, mode=mode, subject=subject, step=step, fills=fills)
        item.image.save(f'{item.id}.png', ContentFile(raw), save=False)
        item.save()
    return private_json({'id': str(item.id), 'count': current + 1, 'limit': ARTWORK_LIMIT}, status=201)

@require_http_methods(['GET', 'DELETE'])
def artwork_detail(request, artwork_id):
    if not authenticated_api(request):
        return api_error('Sign in to use your online sketchbook.', 401)
    try:
        item = Artwork.objects.get(pk=artwork_id, owner=request.user)
    except Artwork.DoesNotExist:
        return api_error('This drawing is not in your sketchbook.', 404)
    if request.method == 'DELETE':
        item.image.delete(save=False)
        item.delete()
        return private_json({'deleted': True, 'count': Artwork.objects.filter(owner=request.user).count()})
    try:
        image = item.image.open('rb').read()
    except OSError:
        return api_error('The saved drawing image is unavailable.', 404)
    return private_json({'state': {'mode': item.mode, 'subject': item.subject, 'step': item.step, 'name': item.title, 'fills': item.fills}, 'png': base64.b64encode(image).decode('ascii')})

@require_GET
def artwork_image(request, artwork_id, download=False):
    if not authenticated_api(request):
        return api_error('Sign in to view your online sketchbook.', 401)
    try:
        item = Artwork.objects.get(pk=artwork_id, owner=request.user)
        image = item.image.open('rb')
    except (Artwork.DoesNotExist, OSError):
        return api_error('This drawing is not available.', 404)
    filename = re.sub(r'[^a-zA-Z0-9_-]+', '-', item.title).strip('-_')[:60] or 'little-drawing'
    response = FileResponse(image, content_type='image/png', as_attachment=download, filename=f'{filename}.png' if download else '')
    response['Cache-Control'] = 'private, no-store'
    response['X-Content-Type-Options'] = 'nosniff'
    return response

@require_GET
def artwork_download(request, artwork_id):
    return artwork_image(request, artwork_id, download=True)

def manifest(request):
    return JsonResponse({
        'id': '/', 'name': 'Little Artist', 'short_name': 'Little Artist',
        'start_url': '/', 'scope': '/', 'display': 'standalone',
        'background_color': '#fcf8ff', 'theme_color': '#fcf8ff',
        'description': 'Watch, draw, and learn with paper-first drawing lessons.',
        'icons': [{'src': f'/static/studio/assets/icon-{size}.png', 'sizes': f'{size}x{size}', 'type': 'image/png', 'purpose': 'any maskable'} for size in (192,512)]
    }, content_type='application/manifest+json')

def service_worker(request):
    source = settings.BASE_DIR / 'studio' / 'static' / 'studio' / 'service-worker.js'
    response = HttpResponse(source.read_text(), content_type='application/javascript')
    response['Cache-Control'] = 'no-cache'
    response['Service-Worker-Allowed'] = '/'
    return response
