from django.urls import path
from rest_framework.routers import DefaultRouter
from accounts.views import (
    RegisterView,
    VerifyOTPView,
    RequestOTPView,
    LoginView,
    LogoutView,
    UserAdminViewSet,
    SellerAdminViewSet,
    SellerProfileView,
    UserProfileUpdateView,
    RequestProfileOTPView,
)
from accounts.views_dashboard import DashboardStatsView

router = DefaultRouter()
router.register(r"users", UserAdminViewSet, basename="user-admin")
router.register(r"sellers", SellerAdminViewSet, basename="seller-admin")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("request-otp/", RequestOTPView.as_view(), name="request-otp"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("dashboard-stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("seller-profile/", SellerProfileView.as_view(), name="seller-profile"),
    path("profile/", UserProfileUpdateView.as_view(), name="user-profile"),
    path(
        "request-profile-otp/",
        RequestProfileOTPView.as_view(),
        name="request-profile-otp",
    ),
]

urlpatterns += router.urls
