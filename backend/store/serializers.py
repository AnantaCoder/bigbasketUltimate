from rest_framework import serializers
from store.models import Item, Category, Cart, OrderUser, OrderItem, Order
from accounts.models import Seller 

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
            "description",
            "is_active",
            "refers_token",
            "created_at",
            "updated_at",
            "is_in_stock",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "is_in_stock"]

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
        
                


        
        
