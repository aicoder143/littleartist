from django.contrib import admin
from .models import Lesson, LessonStep, ColoringPage
class StepInline(admin.TabularInline):
    model = LessonStep
    extra = 1
@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title','difficulty','published']
    inlines = [StepInline]
admin.site.register(ColoringPage)
