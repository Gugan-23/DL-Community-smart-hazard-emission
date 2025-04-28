from django.urls import path
from .views import SignupView, LoginView, ProfileView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('api/profile/', ProfileView.as_view(), name='profile'),  # Fixed URL path
    
]