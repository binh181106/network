from django.contrib.auth.models import AbstractUser
from django.db import models
import pytz
from django.utils import timezone


class User(AbstractUser):
    pass


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avt = models.ImageField(upload_to="profile_avt", default="defaultavt.jpg")
    follower = models.ManyToManyField(User, related_name="following", default=None, blank=True)
    posts = models.ManyToManyField("Posts", related_name="profile_posts", blank=True)
    bio = models.TextField(max_length=100, blank=True)
    
    def __str__(self): 
        return self.user.username
    
    
    
class Posts(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(blank=True, upload_to='post_image/')
    like = models.ManyToManyField(User, related_name="liking", default=None, blank=True)
    
    def __str__(self):
        return f"{self.user.username}: {self.content}"
    
    def callback(self):
        local_time = self.timestamp.astimezone(pytz.timezone('Asia/Ho_Chi_Minh'))
        return {
            "user": self.user.username,
            "id": self.id,
            "content": self.content,
            "timestamp": local_time.strftime("%b %d, %Y, %I:%M %p"),
            "image": self.image.url,
            "like":self.like.count()
        }
    class Meta:
        ordering = ['-timestamp']
    

class Comments(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.CharField(max_length=200)
    commentlike = models.PositiveIntegerField(default =0)
    commenttimestamp = models.DateTimeField(auto_now_add=True)
