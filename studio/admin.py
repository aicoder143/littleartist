from django.contrib import admin
from .models import Artwork, Lesson, LessonStep, ColoringPage
class StepInline(admin.TabularInline):
    model = LessonStep
    extra = 1
@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title','difficulty','published']
    inlines = [StepInline]
admin.site.register(ColoringPage)
@admin.register(Artwork)
class ArtworkAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'mode', 'subject', 'created_at']
    readonly_fields = ['id', 'owner', 'title', 'mode', 'subject', 'step', 'fills', 'image', 'created_at']
    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False
