from rest_framework import serializers
from store.models import Item, Category, Cart, OrderUser, OrderItem, Order
from accounts.models import Seller 
from supabase import create_client , Client
from django.conf import settings
import uuid
import os

supabase_client: Client = None
SUPABASE_BUCKET_NAME = None

try:
    if settings.SUPABASE_URL and settings.SUPABASE_KEY and settings.SUPABASE_BUCKET_NAME:
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        SUPABASE_BUCKET_NAME = settings.SUPABASE_BUCKET_NAME
    else:
        print("Supabase settings (URL, Key, or Bucket Name) are not fully configured in settings.py.")
except AttributeError as e:
    print(f"Warning: Supabase settings not fully loaded. Ensure .env and settings.py are correct. Error: {e}")
except Exception as e:
    print(f"Error initializing Supabase client: {e}")
class CategorySerializer(serializers.ModelSerializer):
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
            "icon",
            "color",
            "popular_brands",
        ]


class ItemSerializer(serializers.ModelSerializer):
    seller = serializers.StringRelatedField(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True
    )

    image = serializers.ListField(
        child=serializers.ImageField(),
        allow_empty=True,
        required=False,
        write_only=True
    )

    image_urls = serializers.ListField(
        child=serializers.URLField(),
        allow_empty=True,
        read_only=True
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
        read_only_fields = ["id", "seller", "created_at", "updated_at", "is_in_stock", "image_urls"]

    def create(self, validated_data):
        user = self.context['request'].user
        if not hasattr(user, "seller"):
            raise serializers.ValidationError("Only sellers can create items")

        # 🔥 Remove fields not in Item model
        images = validated_data.pop("image", [])
        validated_data.pop("image_urls", None)

        uploaded_image_urls = []

        if supabase_client and SUPABASE_BUCKET_NAME:
            for img in images:
                file_extension = os.path.splitext(img.name)[1]
                unique_filename = f"{uuid.uuid4()}{file_extension}"

                try:
                    supabase_client.storage.from_(SUPABASE_BUCKET_NAME).upload(
                        unique_filename,
                        img.read(),
                        {"content-type": img.content_type}
                    )
                    public_url = supabase_client.storage.from_(SUPABASE_BUCKET_NAME).get_public_url(unique_filename)
                    if public_url:
                        uploaded_image_urls.append(public_url)
                except Exception as e:
                    raise serializers.ValidationError(f"Image upload failed for {img.name}: {e}")

        # ✅ Create Item with valid fields only
        item = Item.objects.create(
            seller=user.seller,
            **validated_data
        )

        # ✅ Save Supabase image URLs if Item model has a field
        if hasattr(item, "image_urls"):
            item.image_urls = uploaded_image_urls
            item.save()

        return item



# cart serializers 
class CartSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    seller = serializers.StringRelatedField(read_only=True)
    items = ItemSerializer(many=True, read_only=True)
    price = serializers.DecimalField(max_digits=10 , decimal_places=2,read_only = True)
    total_price = serializers.SerializerMethodField()
    
    item_ids = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(),
        many=True,
        write_only=True,
        source='items',
        required=False
    )

    class Meta:
        model = Cart
        fields = [
            'id', 
            'user', 
            'seller', 
            'items', 
            'item_ids', 
            'created_at', 
            'updated_at',
            'price',
            'total_price',
        ]
        read_only_fields = ['id', 'user', 'seller', 'items', 'created_at', 'updated_at', 'total_price']

    def get_total_price (self , obj):
            return sum(item.price for item in obj.items.all())

# OrderUser serializer
class OrderUserSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = OrderUser
        fields = ['id', 'user', 'phone_no', 'address', 'city', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

# OrderItem serializer
class OrderItemSerializer(serializers.ModelSerializer):
    seller = serializers.StringRelatedField(read_only=True)
    original_item = ItemSerializer(read_only=True)
    original_item_id = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(),
        source='original_item',
        write_only=True
    )

    class Meta:
        model = OrderItem
        fields = ['id', 'item_name', 'price', 'seller', 'original_item', 'original_item_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'seller', 'original_item']

# Order serializer
class OrderSerializer(serializers.ModelSerializer):
    order_user = OrderUserSerializer(read_only=True)
    order_user_id = serializers.PrimaryKeyRelatedField(
        queryset=OrderUser.objects.all(),
        source='order_user',
        write_only=True
    )
    order_items = OrderItemSerializer(many=True, read_only=True)
    order_item_ids = serializers.PrimaryKeyRelatedField(
        queryset=OrderItem.objects.all(),
        many=True,
        source='order_items',
        write_only=True
    )

    class Meta:
        model = Order
        fields = ['id', 'status', 'buyer_email', 'total_amount', 'order_user', 'order_user_id', 'order_items', 'order_item_ids', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'order_user', 'order_items']
        
                


        
        
