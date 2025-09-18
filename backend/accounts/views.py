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
from .permissions import IsSuperUser
from rest_framework import mixins, viewsets, permissions

from accounts.serializers import (
    RegisterSerializer,
    UserSerializers,
    SellerRegistrationSerializer,
    SellerSerializer,
)
from accounts.models import User, OTP, Seller
from django.core.exceptions import ObjectDoesNotExist

logger = logging.getLogger(__name__)


def generate_otp(length=6):
    return "".join(str(random.randint(0, 9)) for _ in range(length))


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "")
        password = request.data.get("password", "")
        otp = request.data.get("otp", None)

        if not email:
            return Response(
                {"detail": "Email is required", "status": "error"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If OTP is provided, authenticate by OTP
        if otp:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"detail": "Invalid credentials.", "status": "error"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            if user.is_otp_blocked():
                return Response(
                    {
                        "detail": "Too many failed OTP attempts. Please try again after 30 minutes.",
                        "status": "error",
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )
            otp_obj = OTP.objects.filter(user=user).order_by("-created_at").first()
            if not otp_obj or otp_obj.code != str(otp):
                user.increment_otp_failed_attempts()
                return Response(
                    {"detail": "Invalid OTP.", "status": "error"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            # Check OTP expiry (10 minutes)
            ttl = timedelta(minutes=10)
            if timezone.now() > (otp_obj.created_at + ttl):
                user.increment_otp_failed_attempts()
                return Response(
                    {"detail": "OTP expired.", "status": "error"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            # OTP valid, delete it and authenticate user
            otp_obj.delete()
            user.reset_otp_attempts()
            user.last_login = timezone.now()
            user.save(update_fields=["last_login"])
            refresh = RefreshToken.for_user(user)
            user_serializer = UserSerializers(user)
            response_data = {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": user_serializer.data,
                "message": "Login successful via OTP",
                "status": "success",
            }
            return Response(response_data, status=status.HTTP_200_OK)

        # Else authenticate by password
        if not password:
            return Response(
                {
                    "detail": "Password is required if OTP not provided",
                    "status": "error",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=email, password=password)

        if user is not None:
            user.last_login = timezone.now()
            user.save(update_fields=["last_login"])
            refresh = RefreshToken.for_user(user)
            user_serializer = UserSerializers(user)
            # Add role info in response
            role = "customer"
            if user.is_superuser:
                role = "admin"
            elif hasattr(user, "seller") and user.seller is not None:
                role = "seller"
            # Removed vendor role detection as no vendor relation exists
            # elif hasattr(user, "vendor") and user.vendor is not None:
            #     role = "vendor"
            response_data = {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": user_serializer.data,
                "role": role,
                "message": "Login successful",
                "status": "success",
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            try:
                user = User.objects.get(email=email)
                if not user.is_active:
                    return Response(
                        {"detail": "Account is not active. Please verify your email."},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            except User.DoesNotExist:
                return Response(
                    {"detail": "Invalid credentials.", "status": "error"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            return Response(
                {"detail": "Invalid credentials.", "status": "error"},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class LogoutView(APIView):

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"detail": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT
            )
        except KeyError:
            return Response(
                {"detail": "Refresh token not provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except TokenError:
            return Response(
                {"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST
            )


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            user = serializer.save()
            # If user is seller, create Seller instance handled in serializer create method
            otp_code = generate_otp(6)
            otp = OTP.objects.create(user=user, code=otp_code)
            try:
                self.send_otp_email(user.email, otp_code)
                return Response(
                    {
                        "message": "User registered. An OTP has been sent to your email to verify it."
                    },
                    status=status.HTTP_201_CREATED,
                )
            except Exception as e:
                logger.error(f"Failed to send OTP email to {user.email}: {e}")
                return Response(
                    {
                        "message": "User registered but we could not send the OTP email.",
                        "detail": "Use the request-otp endpoint to request another OTP.",
                        "email": user.email,
                    },
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
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                fail_silently=False,
            )
            logger.info(f"Sent OTP to {to_email}")
        except BadHeaderError as e:
            logger.error(f"BadHeaderError when sending OTP to {to_email}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error sending OTP to {to_email}: {e}")
            raise


class RequestOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        if not email:
            return Response(
                {"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Create new user for OTP login without signup
            user = User.objects.create_user(
                email=email, password=None, is_active=False, is_email_verified=False
            )

        if user.is_otp_blocked():
            return Response(
                {
                    "detail": "Too many failed OTP attempts. Please try again after 30 minutes."
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        if not user.can_send_otp():
            return Response(
                {
                    "detail": "You have reached the maximum number of OTP requests. Please try again after 30 minutes."
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        otp_code = generate_otp(6)
        otp = OTP.objects.create(user=user, code=otp_code)
        user.send_otp_attempt()
        try:
            self.send_otp_email(user.email, otp_code)
            return Response(
                {"message": "OTP sent to your email"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Failed to send OTP email to {user.email}: {e}")
            return Response(
                {"detail": "Failed to send OTP. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def send_otp_email(self, to_email: str, otp_code: str):
        subject = "Your login OTP"
        message = (
            f"Hello,\n\n"
            f"Use the OTP {otp_code} to login\n\n"
            f"This code is valid for 10 minutes.\n\n"
            f"can be used only once\n\n"
            f"See you soon \n\n"
            f"Team bigbasket\n\n"
        )
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                fail_silently=False,
            )
            logger.info(f"Sent login OTP to {to_email}")
        except BadHeaderError as e:
            logger.error(f"BadHeaderError when sending login OTP to {to_email}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error sending login OTP to {to_email}: {e}")
            raise


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        otp_code = request.data.get("otp")

        if not otp_code or not email:
            return Response(
                {"error": "No otp or email found"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "No user found"}, status=status.HTTP_404_NOT_FOUND
            )

        otp = OTP.objects.filter(user=user).order_by("-created_at").first()

        if not otp:
            return Response(
                {"detail": "No OTP found for this user. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
            return Response(
                {"detail": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST
            )

        if otp.code != str(otp_code):
            return Response(
                {"detail": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST
            )

        if not user.is_active:
            user.is_active = True
        if not user.is_email_verified:
            user.is_email_verified = True
        user.save(update_fields=["is_active", "is_email_verified"])

        otp.delete()

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        user_serializer = UserSerializers(user)

        # Add role info in response
        role = "customer"
        if user.is_superuser:
            role = "admin"
        elif hasattr(user, "seller") and user.seller is not None:
            role = "seller"
        # Vendor role detection removed as no vendor relation exists

        return Response(
            {
                "message": "Email verified successfully. You are now logged in.",
                "refresh": str(refresh),
                "access": str(access),
                "user": user_serializer.data,
                "role": role,
                "status": "success",
            },
            status=status.HTTP_200_OK,
        )


class UserAdminViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = User.objects.all()
    serializer_class = UserSerializers
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        if kwargs.get("pk"):
            return self.retrieve(request, *args, **kwargs)
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class SellerAdminViewSet(viewsets.ModelViewSet):
    queryset = Seller.objects.all()
    serializer_class = SellerSerializer
    permission_classes = [IsSuperUser]


class SellerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = SellerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            return self.request.user.seller
        except Seller.DoesNotExist:
            raise serializers.ValidationError("Seller profile not found.")


class UserProfileUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializers
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)


class RequestProfileOTPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        if user.is_otp_blocked():
            return Response(
                {
                    "detail": "Too many failed OTP attempts. Please try again after 30 minutes."
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        if not user.can_send_otp():
            return Response(
                {
                    "detail": "You have reached the maximum number of OTP requests. Please try again after 30 minutes."
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        otp_code = generate_otp(6)
        otp = OTP.objects.create(user=user, code=otp_code)
        user.send_otp_attempt()
        try:
            self.send_otp_email(user.email, otp_code)
            return Response(
                {"message": "OTP sent to your email"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Failed to send OTP email to {user.email}: {e}")
            return Response(
                {"detail": "Failed to send OTP. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def send_otp_email(self, to_email: str, otp_code: str):
        subject = "Your Profile Update OTP"
        message = (
            f"Hello,\n\n"
            f"Use the OTP {otp_code} to verify your profile update\n\n"
            f"This code is valid for 10 minutes.\n\n"
            f"can be used only once\n\n"
            f"See you soon \n\n"
            f"Team bigbasket\n\n"
        )
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                fail_silently=False,
            )
            logger.info(f"Sent profile OTP to {to_email}")
        except BadHeaderError as e:
            logger.error(f"BadHeaderError when sending profile OTP to {to_email}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error sending profile OTP to {to_email}: {e}")
            raise
