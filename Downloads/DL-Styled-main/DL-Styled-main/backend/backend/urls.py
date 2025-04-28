from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from accounts.views import SignupView, LoginView, ProfileView

def home(request):
    return HttpResponse('''
        <h1>Welcome to Django Backend</h1>
        <div>Server is running successfully!</div>
    ''')



urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('api/profile/', ProfileView.as_view(), name='profile'),  # Ensure this line exists
]