from django.shortcuts import render, redirect,get_object_or_404,HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate
from. models import Register, Article, Like, Comment
from django.db import IntegrityError
from django.template.loader import render_to_string
from django.http import JsonResponse
from django.core.paginator import Paginator

def register(request):
    if request.method == 'POST':
        username = request.POST.get('username_id')
        email = request.POST.get('email_id')
        password = request.POST.get('password_id')
        phone = request.POST.get('phone_id')
        if User.objects.filter(username=username).exists():
            return JsonResponse({'success': False, 'error': 'Username already taken'})

        if User.objects.filter(email=email).exists():   
            return JsonResponse({'success': False, 'error': 'Email already registered'})
        
        if not phone.isdigit() or len(phone) != 10:
            return JsonResponse({'success': False, 'error': 'Phone number must be exactly 10 digits'})
        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()
            Register.objects.create(user=user, phone=phone)
            print(user,phone)
            return JsonResponse({'success': True})
        except IntegrityError:
            return JsonResponse({'success': False, 'error': 'Something went wrong. Try again.'})
    return render(request, 'register.html')

def user_login(request):
    if request.method == 'POST':
        email = request.POST.get('email_id')
        password = request.POST.get('password_id')

        try:
            user_obj = User.objects.get(email=email)        
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None

        if user:
            login(request, user)
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'success': True})
            else:
                return redirect('article_list')
        else:
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'error': 'Invalid credentials'})
            return render(request, 'login.html')
    return render(request, 'login.html')

def draft_list(request):
    drafts = Article.objects.filter(author=request.user, is_draft=True).order_by('-created_at')
    context = {'drafts': drafts}

    if request.headers.get("x-requested-with") == "XMLHttpRequest":
        html = render_to_string("draft_list.html", context, request=request)
        return HttpResponse(html)  
    return render(request, "draft_list.html", context)  

def like(request, article_id):
    article = get_object_or_404(Article, id=article_id)
    user = request.user
    liked = False

    like_obj = Like.objects.filter(article=article, user=user).first()
    if like_obj:
        like_obj.delete()
    else:
        like_obj = Like.objects.create(article=article, user=user)
        liked = True

    return JsonResponse({
        "liked": liked,
        "count": article.like_set.count(),
        "user_id": user.id,
        "username": user.username,
        "liked_at": like_obj.created_at.strftime("%d %b %Y, %H:%M") if liked else "",
    })


def add_comment(request, article_id):
    if request.method == "POST":
        content = request.POST.get("content").strip()
        if not content:
            return JsonResponse({"success": False, "error": "Comment cannot be empty."})
        try:
            article = Article.objects.get(id=article_id)
            comment = Comment.objects.create(article=article,user=request.user,content=content)
            return JsonResponse({
                "success": True,
                "username": request.user.username,
                "content": comment.content,
                "count": article.comments.count()})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})
    return JsonResponse({"success": False, "error": "Invalid request"})

def article_list(request):
    tag = request.GET.get("tag")
    author = request.GET.get("author")

    all_articles = Article.objects.filter(is_draft=False)
    tag_list = {}
    for art in all_articles:
        for t in art.tag_list:
            tag_list[t] = tag_list.get(t, 0) + 1
    tag_list = sorted(tag_list.items())

    articles = all_articles.order_by("-id")

    if tag:
        articles = [a for a in articles if tag in a.tag_list]

    if author:
        articles = articles.filter(author__username__icontains=author)

    paginator = Paginator(articles, 5)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    liked_articles = []
    if request.user.is_authenticated:
        liked_articles = request.user.like_set.values_list("article_id", flat=True)

    return render(request, "article_list.html", {
        "articles": page_obj,
        "tag_list": tag_list, 
        "selected_tag": tag,
        "author_name": author,
        "page_obj": page_obj,
        "liked_articles": liked_articles,
    })


def create_article(request, draft_id=None):
    draft = None
    if draft_id:  
        draft = get_object_or_404(Article, id=draft_id, author=request.user, is_draft=True)
        draft.is_draft = False
        draft.save()

    if request.method == "POST":
        title = request.POST.get("title")
        content = request.POST.get("content")
        tags = request.POST.get("tags")

        if draft:
            draft.title = title
            draft.content = content
            draft.tags = tags

            if "save_as_draft" in request.POST:
                draft.is_draft = True   
            else:
                draft.is_draft = False  
            draft.save()
            return redirect("draft_list" if draft.is_draft else "article_list")
        else:
            article = Article.objects.create(
                title=title,
                content=content,
                tags=tags,
                author=request.user,
                is_draft="save_as_draft" in request.POST)        
            return redirect("draft_list" if article.is_draft else "article_list")

    return render(request, "create_article.html", {"draft": draft})

def delete_draft(request, draft_id):
    draft = get_object_or_404(Article, id=draft_id, author=request.user, is_draft=True)
    draft.delete()
    return redirect("draft_list")


from rest_framework import viewsets, serializers
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source="author.username")
    class Meta:
        model = Article
        fields = "__all__"

class ArticleViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    queryset = Article.objects.all()
    permission_classes = [AllowAny]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        author = request.GET.get('author', '')
      
        queryset = self.get_queryset()
        if author:
            queryset = queryset.filter(author__username__icontains=author)
   
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    

# Use case:  Create, Read, Update, Delete (sab CRUD operations) wants in 1 model .
# Router with use , fast found  full CRUD APIs.
# from rest_framework.viewsets import ModelViewSet
# from .models import Article
# from rest_framework import mixins, GenericViewSet


# class ArticleViewSet(ModelViewSet):
#     queryset = Article.objects.all()
#     serializer_class = ArticleSerializer

# class Model(mixins.CreateModelMixin,
#                    mixins.RetrieveModelMixin,
#                    mixins.UpdateModelMixin,
#                    mixins.DestroyModelMixin,
#                    mixins.ListModelMixin,
#                    GenericViewSet):
