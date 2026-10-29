from django.contrib import admin
from django.urls import path
from studio.views import about, home, manifest, service_worker
urlpatterns = [path('manifest.webmanifest', manifest), path('service-worker.js', service_worker), path('about/', about, name='about'), path('', home, name='home'), path('admin/', admin.site.urls)]
