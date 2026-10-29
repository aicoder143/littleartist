from django.shortcuts import render
from django.views.decorators.http import require_GET
@require_GET
def home(request):
    return render(request, 'studio/index.html')

@require_GET
def about(request):
    return render(request, 'studio/about.html')

from django.http import JsonResponse, HttpResponse
from django.conf import settings
from pathlib import Path

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
