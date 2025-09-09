from django.contrib import admin
from django.utils.html import format_html
from store.models import Category, Item


class ItemInline(admin.TabularInline):
    model = Item
    fields = ("item_name", "manufacturer", "price", "quantity", "sku", "is_active")
    extra = 1
    show_change_link = True


class SubCategoryInline(admin.TabularInline):
    model = Category
    fk_name = "parent"   # tell Django this inline relates to parent → subcategories
    extra = 1
    show_change_link = True


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "is_active", "discount", "created_at", "image_preview")
    search_fields = ("name", "description", "popular_brands")
    list_filter = ("is_active", "parent")
    inlines = [ItemInline, SubCategoryInline]
    readonly_fields = ("image_preview", "created_at")

    fieldsets = (
        (None, {
            "fields": (
                "name", "description", "is_active", "discount", "parent"
            )
        }),
        ("Appearance", {
            "fields": (
                "image", "referral_image", "icon", "color", "popular_brands"
            )
        }),
        ("Meta", {"fields": ("created_at",)}),
    )

    def image_preview(self, obj):
        if getattr(obj, "image", None):
            return format_html('<img src="{}" style="max-height:100px;"/>', obj.image)
        return "-"
    image_preview.short_description = "Image preview"


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = (
        "item_name", "manufacturer", "seller", "category", "price",
        "quantity", "is_active", "sku", "created_at", "image_preview"
    )
    list_editable = ("price", "quantity", "is_active")
    list_filter = ("category", "is_active", "manufacturer")
    search_fields = ("item_name", "manufacturer", "sku", "description")
    readonly_fields = ("image_preview", "created_at", "updated_at")

    fieldsets = (
        (None, {
            "fields": (
                "item_name", "item_type", "manufacturer", "seller",
                "category", "sku"
            )
        }),
        ("Inventory & Pricing", {"fields": ("quantity", "price", "is_active")}),
        ("Media", {"fields": ("image_urls", "image_preview")}),
        ("Meta", {"fields": ("created_at", "updated_at")}),
    )

    actions = ["mark_active", "mark_inactive"]

    def image_preview(self, obj):
        urls = getattr(obj, "image_urls", None) or []
        first = urls[0] if isinstance(urls, (list, tuple)) and len(urls) > 0 else None
        if first:
            return format_html('<img src="{}" style="max-height:100px;"/>', first)
        return "-"
    image_preview.short_description = "Image preview"

    def mark_active(self, request, queryset):
        queryset.update(is_active=True)
    mark_active.short_description = "Mark selected items as active"

    def mark_inactive(self, request, queryset):
        queryset.update(is_active=False)
    mark_inactive.short_description = "Mark selected items as inactive"
