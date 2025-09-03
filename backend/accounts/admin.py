from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django import forms

from .models import User, Seller, OTP


class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Password confirmation", widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ("email", "first_name", "last_name")

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = (
            "email",
            "password",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "is_superuser",
            "is_email_verified",
        )

    def clean_password(self):
        return self.initial.get("password")


class SellerInline(admin.StackedInline):
    model = Seller
    can_delete = False
    verbose_name_plural = "seller"
    fk_name = "user"


class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    inlines = (SellerInline,)

    list_display = (
        "email",
        "first_name",
        "last_name",
        "is_email_verified",
        "is_staff",
        "is_superuser",
    )
    list_filter = ("is_staff", "is_superuser", "is_email_verified")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "is_email_verified", "groups", "user_permissions")} ),
        ("Important dates", {"fields": ("last_login",)}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "first_name", "last_name", "password1", "password2", "is_staff", "is_active"),
            },
        ),
    )

    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    filter_horizontal = ("groups", "user_permissions")


admin.site.register(User, UserAdmin)


@admin.register(Seller)
class SellerAdmin(admin.ModelAdmin):
    list_display = ("shop_name", "user_email", "seller_type", "is_verified", "created_at")
    search_fields = ("shop_name", "user__email", "gst_number")
    list_filter = ("seller_type", "is_verified")
    raw_id_fields = ("user",)

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = "User Email"


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ("user", "code", "created_at", "expired_at")
    search_fields = ("user__email", "code")
    readonly_fields = ("created_at", "expired_at")
    list_filter = ("created_at",)
