
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<int:user_id>", views.profile, name="profile"),
    
    #APIs path
    path("post", views.postpost, name="post"),
    path("home", views.allposts, name="allposts"),
    path("profile/<int:user_id>/toggle-follow", views.follow, name="follow"),
    path("profile/<int:profile_id>/updatebio", views.updatebio, name="updatebio"),
    path("home/following", views.followingposts, name="followingposts"),
    path("edit/<int:post_id>", views.edit, name="edit"),
    path("like/<int:post_id>", views.togglelike, name="togglelike")
]
