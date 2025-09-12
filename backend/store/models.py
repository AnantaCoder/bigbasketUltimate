from django.db import models
from django.conf import settings
from accounts.models import Seller, User
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    discount = models.CharField(max_length=20, null=True, blank=True)
    image = models.URLField(null=True, blank=True)
    icon = models.CharField(max_length=25, null=True, blank=True)
    color = models.CharField(max_length=25, null=True, blank=True)
    referral_image = models.URLField(null=True, blank=True)
    popular_brands = models.JSONField(default=list, null=True, blank=True)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        related_name="subcategories",
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Item(models.Model):
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name="items")
    item_name = models.CharField(max_length=200, db_index=True)
    item_type = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=200)

    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="items"
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
    refers_token = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["seller", "is_active"]),
            models.Index(fields=["category", "is_active"]),
            models.Index(fields=["item_name", "is_active"]),
        ]

    def __str__(self):
        return f"{self.item_name}({self.manufacturer})"

    @property
    def is_in_stock(self):
        return self.quantity > 0


# CartItem through model to handle quantity per item in cart
class CartItem(models.Model):
    cart = models.ForeignKey(
        "Cart", on_delete=models.CASCADE, related_name="cart_items"
    )
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="cart_items")
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("cart", "item")

    def __str__(self):
        return f"{self.quantity} x {self.item.item_name} in {self.cart}"

    @property
    def total_price(self):
        return self.quantity * self.item.price


# create a cart model with user seller and user as foreign key and items referenced  from item table
class Cart(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="carts")
    seller = models.ForeignKey(
        Seller, on_delete=models.CASCADE, related_name="carts", null=True, blank=True
    )
    items = models.ManyToManyField(Item, related_name="carts", through=CartItem)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart of {self.user.username} with {self.cart_items.count()} items"

    @property
    def total_price(self):
        return sum(cart_item.total_price for cart_item in self.cart_items.all())


# OrderUser model
class OrderUser(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="order_users")
    phone_no = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"OrderUser: {self.user.username} ({self.city})"


# OrderItem model
class OrderItem(models.Model):
    item_name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    seller = models.ForeignKey(
        Seller, on_delete=models.CASCADE, related_name="order_items"
    )
    original_item = models.ForeignKey(
        Item, on_delete=models.CASCADE, related_name="order_items"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"OrderItem: {self.item_name} - {self.price} x {self.quantity}"

    @property
    def total_price(self):
        return self.quantity * self.price


# Order model
class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    buyer_email = models.EmailField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    order_user = models.ForeignKey(
        OrderUser, on_delete=models.CASCADE, related_name="orders"
    )
    order_items = models.ManyToManyField(OrderItem, related_name="orders")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - {self.status}"
