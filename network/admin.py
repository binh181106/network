from django.contrib import admin
from .models import User, Posts, Profile
# Register your models here.
admin.site.register(Posts)
admin.site.register(Profile)
admin.site.register(User)