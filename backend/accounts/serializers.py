from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from accounts.models import Seller, OTP

User = get_user_model()


class UserSerializers(serializers.ModelSerializer):
    is_seller = serializers.ReadOnlyField()
    is_superuser = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "is_email_verified",
            "is_seller",
            "is_superuser",
        )
        read_only_fields = ("id", "is_email_verified", "is_seller", "is_superuser")


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    password2 = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )
    is_seller = serializers.BooleanField(default=False, write_only=True)
    # Seller-specific fields (optional, only required if is_seller=True)
    shop_name = serializers.CharField(max_length=200, required=False, write_only=True)
    gst_number = serializers.CharField(max_length=15, required=False, write_only=True)
    address = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = User
        fields = ("email", "password", "password2", "first_name", "last_name", "phone", "is_seller", "shop_name", "gst_number", "address")
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )

        # If is_seller is True, validate seller-specific fields
        if attrs.get("is_seller"):
            if not attrs.get("shop_name"):
                raise serializers.ValidationError({"shop_name": "Shop name is required for sellers."})
            if not attrs.get("gst_number"):
                raise serializers.ValidationError({"gst_number": "GST number is required for sellers."})
            if not attrs.get("address"):
                raise serializers.ValidationError({"address": "Address is required for sellers."})

        return attrs

    def create(self, validated_data):
        # Extract seller-specific data
        is_seller = validated_data.pop("is_seller", False)
        shop_name = validated_data.pop("shop_name", None)
        gst_number = validated_data.pop("gst_number", None)
        address = validated_data.pop("address", None)

        # Remove password2 from validated data
        validated_data.pop("password2", None)

        user = User.objects.create_user(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            password=validated_data["password"],
            phone=validated_data.get("phone"),
        )

        # If registering as seller, create Seller instance
        if is_seller:
            Seller.objects.create(
                user=user,
                shop_name=shop_name,
                gst_number=gst_number,
                address=address,
            )

        return user


class SellerRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seller
        fields = ["shop_name", "gst_number", "address"]

    def create(self, validated_data):
        user = self.context["request"].user

        if hasattr(user, "seller"):
            raise serializers.ValidationError("User is already a registered seller")

        return Seller.objects.create(user=user, **validated_data)


class SellerSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = Seller
        fields = [
            "user_email",
            "user_name",
            "shop_name",
            "gst_number",
            "address",
            "seller_type",
            "is_verified",
            "created_at",
            "updated_at",
        ]
        read_only_fields = (
            "user_email",
            "user_name",
            "is_verified",
            "created_at",
            "updated_at",
        )
