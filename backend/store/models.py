from django.db import models
from django.conf import settings
from accounts.models import Seller , User
from django.utils import timezone



class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    discount = models.CharField(max_length=20, null=True,blank=True)
    image = models.URLField(null=True,blank=True)
    icon= models.CharField(max_length=25,null=True,blank=True)
    color= models.CharField(max_length=25,null=True,blank=True)
    popular_brands = models.JSONField(default=list,null=True,blank=True)
    class Meta:
        verbose_name_plural = 'Categories'
    
    def __str__(self):
        return self.name


class Item(models.Model):
    seller = models.ForeignKey(
        Seller,
        on_delete=models.CASCADE,
        related_name='items'
    )
    item_name = models.CharField(max_length=200, db_index=True)
    item_type = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=200)
    
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='items'
    )
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    
    image_urls = models.JSONField(
        default=list, 
        blank=True,
        null=True,
    )
    sku = models.CharField(max_length=100, unique=True, blank=True)  
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['seller', 'is_active']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['item_name', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.item_name}({self.manufacturer})"
    
    @property 
    def is_in_stock(self):
        return self.quantity > 0
    