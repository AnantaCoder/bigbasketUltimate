from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.utils import timezone
from django.core.mail import send_mail, BadHeaderError
from django.conf import settings
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django.db import transaction
from datetime import timedelta
from rest_framework import status, generics, permissions, viewsets, mixins, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
import logging
import random

from accounts.serializers import (
    RegisterSerializer,
    UserSerializers,
    SellerRegistrationSerializer,
    SellerSerializer,
)
from accounts.models import User, OTP

logger = logging.getLogger(__name__)


def generate_otp(length=6):
    return ''.join(str(random.randint(0, 9)) for _ in range(length))


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "")
        password = request.data.get("password", "")

        if not email or not password:
            return Response({"detail": "Email and Password is required", "status": "error"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)

        if user is not None:
            user.last_login = timezone.now()
            user.save(update_fields=["last_login"])
            refresh = RefreshToken.for_user(user)
            user_serializer = UserSerializers(user)
            response_data = {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": user_serializer.data,
                "message": "Login successful",
                "status": "success",
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            try:
                user = User.objects.get(email=email)
                if not user.is_active:
                    return Response({"detail": "Account is not active. Please verify your email."}, status=status.HTTP_403_FORBIDDEN)
            except User.DoesNotExist:
                return Response({"detail": "Invalid credentials.", "status": "error"}, status=status.HTTP_401_UNAUTHORIZED)
            return Response({"detail": "Invalid credentials.", "status": "error"}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except KeyError:
            return Response({"detail": "Refresh token not provided."}, status=status.HTTP_400_BAD_REQUEST)
        except TokenError:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
                                                
    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            user = serializer.save()
            otp_code = generate_otp(6)
            otp = OTP.objects.create(user=user, code=otp_code)
            try:
                self.send_otp_email(user.email, otp_code)
                return Response({"message": "User registered. An OTP has been sent to your email to verify it."}, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Failed to send OTP email to {user.email}: {e}")
                return Response(
                    {"message": "User registered but we could not send the OTP email.", "detail": "Use the request-otp endpoint to request another OTP.", "email": user.email},
                    status=status.HTTP_201_CREATED,
                )

    def send_otp_email(self, to_email: str, otp_code: str):
        subject = "Your verification OTP"
        message = (
            f"Hello,\n\n"
            f"Use the OTP {otp_code} to login\n\n"
            f"This code is valid for 10 minutes.\n\n"
            f"can be used only once\n\n"
            f"See you soon \n\n"
            f"Team bigbasket\n\n"
        )
        try:
            send_mail(subject=subject, message=message, from_email=settings.DEFAULT_FROM_EMAIL, recipient_list=[to_email], fail_silently=False)
            logger.info(f"Sent OTP to {to_email}")
        except BadHeaderError as e:
            logger.error(f"BadHeaderError when sending OTP to {to_email}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error sending OTP to {to_email}: {e}")
            raise


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        otp_code = request.data.get("otp")

        if not otp_code or not email:
            return Response({"error": "No otp or email found"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "No user found"}, status=status.HTTP_404_NOT_FOUND)

        otp = OTP.objects.filter(user=user).order_by("-created_at").first()

        if not otp:
            return Response({"detail": "No OTP found for this user. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate expiry
        is_valid = False
        if hasattr(otp, "is_valid") and callable(getattr(otp, "is_valid")):
            try:
                is_valid = otp.is_valid()
            except Exception:
                is_valid = False
        else:
            ttl = timedelta(minutes=10)
            is_valid = timezone.now() <= (otp.created_at + ttl)

        if not is_valid:
            return Response({"detail": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)

        if otp.code != str(otp_code):
            return Response({"detail": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_active:
            user.is_active = True
        if not user.is_email_verified:
            user.is_email_verified = True
        user.save(update_fields=["is_active", "is_email_verified"])

        otp.delete()

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        user_serializer = UserSerializers(user)

        return Response(
            {
                "message": "Email verified successfully. You are now logged in.",
                "refresh": str(refresh),
                "access": str(access),
                "user": user_serializer.data,
                "status": "success",
            },
            status=status.HTTP_200_OK,
        )

