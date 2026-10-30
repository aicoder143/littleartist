from django.contrib import admin
from django.urls import path
from studio.views import about, account_login, account_logout, artwork_collection, artwork_detail, artwork_download, artwork_image, home, manifest, service_worker, signup, story
urlpatterns = [
    path('manifest.webmanifest', manifest), path('service-worker.js', service_worker),
    path('accounts/signup/', signup, name='signup'), path('accounts/login/', account_login, name='login'), path('accounts/logout/', account_logout, name='logout'),
    path('api/artworks/', artwork_collection, name='artwork-collection'),
    path('api/artworks/<uuid:artwork_id>/', artwork_detail, name='artwork-detail'),
    path('api/artworks/<uuid:artwork_id>/image/', artwork_image, name='artwork-image'),
    path('api/artworks/<uuid:artwork_id>/download/', artwork_download, name='artwork-download'),
    path('about/', about, name='about'), path('our-story/', story, name='story'),
    path('', home, name='home'), path('admin/', admin.site.urls),
]
