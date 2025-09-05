from django.urls import path, include
from django.contrib.auth import views as auth_views
from . import views
from rest_framework.routers import DefaultRouter
from .views import ArticleViewSet

router = DefaultRouter()
router.register(r'posts', ArticleViewSet, basename="posts") 

urlpatterns = [

    path('article_list/', views.article_list, name='article_list'),
    path('', views.article_list),
    path('register/', views.register, name='register'),
    path('login/', views.user_login, name='login'),
    path('draft_list/', views.draft_list, name='draft_list'),
    path("like/<int:article_id>/", views.like, name="toggle_like"),
    path("comment/<int:article_id>/", views.add_comment, name="add_comment"),
    path("logout/", auth_views.LogoutView.as_view(next_page="article_list"), name="logout"),
    path("edit_draft/<int:draft_id>/", views.create_article, name="edit_draft"),
    path("delete_draft/<int:draft_id>/", views.delete_draft, name="delete_draft"),
    path("create_article/", views.create_article, name="create_article"),
    path("api/", include(router.urls)),
]
    






