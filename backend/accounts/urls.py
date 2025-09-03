from django.urls import path
from accounts.views import (
    RegisterView, VerifyOTPView, LoginView, LogoutView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name="register"),
    path('verify-otp/', VerifyOTPView.as_view(), name="verify-otp"),
    path('login/', LoginView.as_view(), name="login"),
    path('logout/', LogoutView.as_view(), name="logout"),
]
