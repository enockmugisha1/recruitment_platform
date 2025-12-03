from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterUserView, LoginUserView, UpdateUserView, DeleteUserView, 
    LogoutUserView, OTPRequestView, OTPVerifyView, PasswordResetView
)

urlpatterns = [
    path("register/", RegisterUserView.as_view(), name="register"),
    path("login/", LoginUserView.as_view(), name="login"),
    path("logout/", LogoutUserView.as_view(), name="logout"),
    path("update/", UpdateUserView.as_view(), name="update"),
    path("delete/", DeleteUserView.as_view(), name="delete"),
    path("otp/request/", OTPRequestView.as_view(), name="otp_request"),
    path("otp/verify/", OTPVerifyView.as_view(), name="otp_verify"),
    path("password/reset/", PasswordResetView.as_view(), name="password_reset"),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]