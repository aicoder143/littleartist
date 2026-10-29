from django.db import models

class Lesson(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=120)
    difficulty = models.CharField(max_length=16, choices=[('explore','Explore'),('practice','Practice'),('challenge','Challenge')])
    description = models.TextField(blank=True)
    published = models.BooleanField(default=False)
    def __str__(self): return self.title

class LessonStep(models.Model):
    lesson = models.ForeignKey(Lesson, related_name='steps', on_delete=models.CASCADE)
    order = models.PositiveSmallIntegerField()
    instruction = models.CharField(max_length=240)
    # A reviewed local asset path, never user-supplied SVG markup.
    guide_asset = models.CharField(max_length=240, blank=True)
    class Meta:
        ordering = ['order']
        constraints = [models.UniqueConstraint(fields=['lesson','order'],name='unique_lesson_step')]

class ColoringPage(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=120)
    category = models.CharField(max_length=40)
    asset_path = models.CharField(max_length=240)
    source_url = models.URLField(blank=True)
    license_name = models.CharField(max_length=80)
    attribution = models.TextField(blank=True)
    published = models.BooleanField(default=False)
    def __str__(self): return self.title
