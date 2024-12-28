import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.utils import timezone
import pytz

from .models import User, Posts, Comments, Profile


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def postpost(request):
    if request.method != "POST":
        return JsonResponse({"error":"POST request required"}, status=400)
    try: 
        user = request.user
        content = request.POST.get('content')
        image = request.FILES.get('image')
        
        post = Posts(
            user = user,
            content = content,
            image = image
        )
        post.save()
        return JsonResponse({"message":"Successfully upload your post"}, status=201)
    except Exception as e:
          return JsonResponse({"error": str(e)}, status=500)
      
def allposts(request):
    allposts = Posts.objects.all().order_by('-timestamp')
    
    # Paginator
    paginator = Paginator(allposts, 10)
    page_number = request.GET.get('current_page', 1)
    page_objects = paginator.get_page(page_number)
    
    data = {
        "posts": [
            {
                "post": post.callback(), 
                "has_liked": request.user in post.like.all(),
                "profile_url": reverse("profile", args=[post.user.id])  
            }
            for post in page_objects
        ],
        "page_obj": {
            "has_previous": page_objects.has_previous(),
            "previous_page_number": page_objects.previous_page_number() if page_objects.has_previous() else None,
            "number": page_objects.number,
            "has_next": page_objects.has_next(),
            "next_page_number": page_objects.next_page_number() if page_objects.has_next() else None,
            "paginator": {
                "num_pages": paginator.num_pages
            },
            "current_user" :request.user.username
        }
    }
    
    return JsonResponse(data, safe = False)

def profile(request, user_id):
    user_object = User.objects.get(id=user_id)
    try:
        user_profile = Profile.objects.get(user=user_object)
    except Profile.DoesNotExist:
        user_profile = Profile.objects.create(
            user = user_object,
        )
        user_profile.save()
    
    user_posts = Posts.objects.filter(user=user_object)
    user_profile.posts.add(*user_posts)
    user_posts_length = len(user_posts)
    user_follower_count = user_profile.follower.count()
    user_following_count = Profile.objects.filter(follower = user_object).count()
    
    # Display follow and unfollow button
    has_follow = request.user in user_profile.follower.all()
    
    context ={
        "user_object": user_object,
        "user_profile": user_profile,
        "user_posts":  user_posts,
        "user_posts_length": user_posts_length,
        "user_follower_count": user_follower_count,
        "user_following_count": user_following_count,
        "has_follow": has_follow
    }
    
    return render(request, 'network/profile.html', context)

@login_required
def follow(request, user_id):
    
    if request.method == "POST":
        try:
            user_object = User.objects.get(id = user_id)
            user_profile= Profile.objects.get(user = user_object)
        except User.DoesNotExist:
            return JsonResponse({"Error":"User does not exist."}, status=404)
        except Profile.DoesNotExist:
            return JsonResponse({"Error": "Profile does not exist."}, status=404)
        
        
        if request.user in user_profile.follower.all():
            user_profile.follower.remove(request.user)
            is_following = False
        else:
            user_profile.follower.add(request.user)
            is_following = True
        user_profile.save()
        
        follower_count = user_profile.follower.count()
        
        
        return JsonResponse({
            "is_following": is_following,
            "follower_count": follower_count
        }, status = 200)
        
    return JsonResponse({"Error":"POST method required."}, status = 400)

@login_required
def followingposts(request):
    following_users = Profile.objects.filter(follower = request.user).values_list('user', flat=True)
    
    following_user_posts = Posts.objects.filter(user__id__in=following_users).order_by('-timestamp')
    data = [
        {
            "post": post.callback(),
            "profile_url": reverse("profile", args=[post.user.id])
        }
        for post in following_user_posts
    ]
    return JsonResponse(data, safe =False)
        
        
@login_required
def edit(request, post_id):
    if request.method == 'POST':
        try:
            post_obj = Posts.objects.get(user=request.user, id= post_id)
            data = json.loads(request.body)
            post_obj.content = data.get('content', post_obj.content)
            post_obj.timestamp = timezone.now()
            post_obj.save()
            local_time = post_obj.timestamp.astimezone(pytz.timezone('Asia/Ho_Chi_Minh'))
            return JsonResponse({
                "message":"Edit successfully",
                "updated_timestamp": local_time.strftime("%b %d, %Y, %I:%M %p")
                }, status=200)
        except Posts.DoesNotExist:
            return JsonResponse({"error":"Post not found"},status=404 )
    return JsonResponse({"error":"POST method required"}, status=400)

@login_required
def togglelike(request, post_id):
    if request.method == "POST":
        try:
            post_obj = Posts.objects.get(id=post_id)
        except Posts.DoesNotExist:
            return JsonResponse({"error":"Post not found"}, status=404)
        
        if request.user in post_obj.like.all():
            post_obj.like.remove(request.user)
            is_liking =False
        else:
            post_obj.like.add(request.user)
            is_liking =True
        current_like=post_obj.like.count()
        return JsonResponse({
            "is_liking": is_liking,
            "current_like":current_like,      
        }, status=200)
    return JsonResponse({
        "error":"POST method required."
    }, status=400)
            
    
    
def updatebio(request, profile_id):
    if request.method == 'POST':
        try: 
            user_profile = Profile.objects.get(id = profile_id)
        except Profile.DoesNotExist:
            return JsonResponse({"error":"Profile not found."}, status=404)
        data = json.loads(request.body)
        newbio = data.get('bio', '')
        user_profile.bio = newbio
        user_profile.save()
        return JsonResponse({"message": "Update bio successfully"})
    else:
        return JsonResponse({'message': "POST method required"}, status=400)
        
    