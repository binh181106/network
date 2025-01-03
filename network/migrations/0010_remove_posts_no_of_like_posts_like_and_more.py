# Generated by Django 5.1.2 on 2024-12-16 15:52

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0009_alter_profile_user'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='posts',
            name='no_of_like',
        ),
        migrations.AddField(
            model_name='posts',
            name='like',
            field=models.ManyToManyField(blank=True, default=None, related_name='liking', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='profile',
            name='follower',
            field=models.ManyToManyField(blank=True, default=None, related_name='following', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='profile',
            name='posts',
            field=models.ManyToManyField(blank=True, related_name='profile_posts', to='network.posts'),
        ),
    ]
