from django.urls import path
from rest_framework.routers import DefaultRouter
from accounts.views import (
    RegisterView,
    VerifyOTPView,
    LoginView,
    LogoutView,
    UserAdminViewSet,
    SellerAdminViewSet,
    SellerProfileView,
)
from accounts.views_dashboard import DashboardStatsView

router = DefaultRouter()
router.register(r"users", UserAdminViewSet, basename="user-admin")
router.register(r"sellers", SellerAdminViewSet, basename="seller-admin")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("dashboard-stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("seller-profile/", SellerProfileView.as_view(), name="seller-profile"),
]

urlpatterns += router.urls
