import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('studio', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Artwork',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=80)),
                ('mode', models.CharField(choices=[('draw', 'Draw'), ('lesson', 'Trace'), ('color', 'Color')], max_length=12)),
                ('subject', models.CharField(max_length=24)),
                ('step', models.PositiveSmallIntegerField(default=0)),
                ('fills', models.JSONField(blank=True, default=list)),
                ('image', models.FileField(upload_to='artworks/%Y/%m/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='artworks', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AddIndex(model_name='artwork', index=models.Index(fields=['owner', '-created_at'], name='art_owner_created_idx')),
    ]
