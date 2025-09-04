from rest_framework import serializers
from store.models import Item , Category , Cart
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
        
        


        
        
