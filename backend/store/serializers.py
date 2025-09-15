from rest_framework import serializers
from store.models import *
from accounts.models import Seller
from django.conf import settings
import uuid
import os
from store.supabase_client import supabase_client, SUPABASE_BUCKET_NAME


# ==============================
# Recursive helper
# ==============================
class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        parent_serializer = self.parent.parent.__class__
        depth = self.context.get("depth", 1)

        # prevent infinite nesting
        if depth > 2:  # ⬅️ limit recursion depth here
            return None

        serializer = parent_serializer(
            value, context={**self.context, "depth": depth + 1}
        )
        return serializer.data


# ==============================
# Category Serializer
# ==============================
class CategorySerializer(serializers.ModelSerializer):
    subcategories = RecursiveField(many=True, read_only=True)

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "is_active",
            "created_at",
            "discount",
            "image",
            "referral_image",  # make sure this exists in your model
            "icon",
            "color",
            "popular_brands",
            "parent",  # parent category
            "subcategories",  # recursive children
        ]


# ==============================
# Category Breadcrumb Serializer
# ==============================
class CategoryBreadcrumbSerializer(serializers.ModelSerializer):
    parent = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "parent"]

    def get_parent(self, obj):
        if obj.parent:
            return CategoryBreadcrumbSerializer(obj.parent).data
        return None


# ==============================
# Item Serializer
# ==============================
class ItemSerializer(serializers.ModelSerializer):
    seller = serializers.StringRelatedField(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True,
    )

    image = serializers.ListField(
        child=serializers.ImageField(),
        allow_empty=True,
        required=False,
        write_only=True,
    )

    image_urls = serializers.ListField(
        child=serializers.URLField(), allow_empty=True, read_only=True
    )

    class Meta:
        model = Item
        fields = [
            "id",
            "seller",
            "item_name",
            "item_type",
            "manufacturer",
            "category",
            "category_id",
            "quantity",
            "price",
            "image_urls",
            "sku",
            "image",
            "description",
            "is_active",
            "refers_token",
            "created_at",
            "updated_at",
            "is_in_stock",
        ]
        read_only_fields = [
            "id",
            "seller",
            "created_at",
            "updated_at",
            "is_in_stock",
            "image_urls",
        ]

    def create(self, validated_data):
        user = self.context["request"].user
        if not hasattr(user, "seller"):
            raise serializers.ValidationError("Only sellers can create items")

        # remove fields not in Item model
        images = validated_data.pop("image", [])
        validated_data.pop("image_urls", None)

        uploaded_image_urls = []

        if supabase_client and SUPABASE_BUCKET_NAME:
            for img in images:
                file_extension = os.path.splitext(img.name)[1]
                unique_filename = f"{uuid.uuid4()}{file_extension}"

                try:
                    supabase_client.storage.from_(SUPABASE_BUCKET_NAME).upload(
                        unique_filename, img.read(), {"content-type": img.content_type}
                    )
                    public_url = supabase_client.storage.from_(
                        SUPABASE_BUCKET_NAME
                    ).get_public_url(unique_filename)
                    if public_url:
                        uploaded_image_urls.append(public_url)
                except Exception as e:
                    raise serializers.ValidationError(
                        f"Image upload failed for {img.name}: {e}"
                    )

        # create item
        item = Item.objects.create(seller=user.seller, **validated_data)

        # save Supabase image URLs if model has field
        if hasattr(item, "image_urls"):
            item.image_urls = uploaded_image_urls
            item.save()

        return item


# ==============================
# CartItem Serializer
# ==============================
class CartItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(), source="item", write_only=True
    )
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "item",
            "item_id",
            "quantity",
            "total_price",
        ]
        read_only_fields = ["id", "item", "total_price"]

    def get_total_price(self, obj):
        return obj.quantity * obj.item.price


# ==============================
# Cart Serializer
# ==============================
class CartSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    seller = serializers.StringRelatedField(read_only=True)
    cart_items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    # For adding items - expect item_ids and optional quantities
    item_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    quantities = serializers.ListField(
        child=serializers.IntegerField(min_value=1), write_only=True, required=False
    )

    class Meta:
        model = Cart
        fields = [
            "id",
            "user",
            "seller",
            "cart_items",
            "item_ids",
            "quantities",
            "created_at",
            "updated_at",
            "total_price",
        ]
        read_only_fields = [
            "id",
            "user",
            "seller",
            "cart_items",
            "created_at",
            "updated_at",
            "total_price",
        ]

    def get_total_price(self, obj):
        return sum(cart_item.total_price for cart_item in obj.cart_items.all())

    def create(self, validated_data):
        user = self.context["request"].user
        cart, _ = Cart.objects.get_or_create(user=user)

        item_ids = validated_data.pop("item_ids", [])
        quantities = validated_data.pop("quantities", [])

        for idx, item_id in enumerate(item_ids):
            item = Item.objects.get(id=item_id)
            qty = quantities[idx] if idx < len(quantities) else 1
            CartItem.objects.create(cart=cart, item=item, quantity=qty)

        return cart


# ==============================
# OrderUser Serializer
# ==============================
class OrderUserSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = OrderUser
        fields = [
            "id",
            "user",
            "phone_no",
            "address",
            "city",
            "state",
            "pincode",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def validate_phone_no(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits.")
        if len(value) < 10 or len(value) > 15:
            raise serializers.ValidationError(
                "Phone number must be between 10 and 15 digits."
            )
        return value

    def validate_pincode(self, value):
        if value and (not value.isdigit() or len(value) != 6):
            raise serializers.ValidationError("Pincode must be 6 digits.")
        return value


# ==============================
# OrderItem Serializer
# ==============================
class OrderItemSerializer(serializers.ModelSerializer):
    seller = serializers.StringRelatedField(read_only=True)
    original_item = ItemSerializer(read_only=True)
    original_item_id = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(), source="original_item", write_only=True
    )
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "item_name",
            "price",
            "quantity",
            "total_price",
            "seller",
            "original_item",
            "original_item_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "seller",
            "original_item",
            "total_price",
        ]

    def get_total_price(self, obj):
        return obj.total_price


# ==============================
# SavedForLater Serializer
# ==============================
class SavedForLaterSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(), source="item", write_only=True
    )

    class Meta:
        model = SavedForLater
        fields = [
            "id",
            "user",
            "item",
            "item_id",
            "quantity",
            "added_at",
        ]
        read_only_fields = ["id", "user", "added_at"]


# ==============================
# Order Serializer
# ==============================
class OrderSerializer(serializers.ModelSerializer):
    order_user = OrderUserSerializer(read_only=True)
    order_user_id = serializers.PrimaryKeyRelatedField(
        queryset=OrderUser.objects.all(), source="order_user", write_only=True
    )
    order_items = OrderItemSerializer(many=True, read_only=True)
    order_item_ids = serializers.PrimaryKeyRelatedField(
        queryset=OrderItem.objects.all(),
        many=True,
        source="order_items",
        write_only=True,
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "buyer_email",
            "total_amount",
            "order_user",
            "order_user_id",
            "order_items",
            "order_item_ids",
            "tracking_number",
            "estimated_delivery",
            "shipped_at",
            "delivered_at",
            "created_at",
            "updated_at",
            "is_active",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "order_user",
            "order_items",
            "shipped_at",
            "delivered_at",
            "is_active",
        ]

    def create(self, validated_data):
        order_user = validated_data.pop("order_user")
        order_items = validated_data.pop("order_items", [])
        user = self.context["request"].user

        order = Order.objects.create(order_user=order_user, **validated_data)
        order.order_items.set(order_items)

        return order
