from rest_framework import serializers
from store.models import Item , Category
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