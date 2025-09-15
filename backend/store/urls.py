from django.urls import path, include
from store.views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"new-items", ItemViewSet, basename="item")

urlpatterns = [
    path("categories/", CategoryListCreateAPIView.as_view(), name="category-list-create"),
    path("categories/<int:pk>/", CategoryDetailAPIView.as_view(), name="category-detail"),
    path("categories/<int:pk>/breadcrumb/", CategoryBreadcrumbAPIView.as_view(), name="category-breadcrumb"),
    path("categories/<int:pk>/items/", CategoryItemsAPIView.as_view(), name="category-items"),
    path("items/", ItemListCreateAPIView.as_view(), name="item-list-create"),
    path("items/<int:pk>/", ItemRetrieveUpdateDestroyAPIView.as_view(), name="item-detail"),
    path("cart/", CartListCreateAPIView.as_view(), name="cart-list-create"),
    # OrderUser endpoints
    path(
        "order-users/",
        OrderUserListCreateAPIView.as_view(),
        name="orderuser-list-create",
    ),
    path(
        "order-users/<int:pk>/",
        OrderUserRetrieveUpdateDestroyAPIView.as_view(),
        name="orderuser-detail",
    ),
    # OrderItem endpoints
    path(
        "order-items/",
        OrderItemListCreateAPIView.as_view(),
        name="orderitem-list-create",
    ),
    path(
        "order-items/<int:pk>/",
        OrderItemRetrieveUpdateDestroyAPIView.as_view(),
        name="orderitem-detail",
    ),
    # Order endpoints
    path("orders/", OrderListCreateAPIView.as_view(), name="order-list-create"),
    path(
        "orders/<int:pk>/",
        OrderRetrieveUpdateDestroyAPIView.as_view(),
        name="order-detail",
    ),
    path("checkout/", CheckoutAPIView.as_view(), name="checkout"),
    path("search-address/", SearchAddressAPIView.as_view(), name="search-address"),
    # User order history
    path("user-orders/", UserOrderListAPIView.as_view(), name="user-orders"),
    # Seller orders
    path("seller-orders/", SellerOrderListAPIView.as_view(), name="seller-orders"),
    # Order update
    path("orders/<int:pk>/update/", OrderUpdateAPIView.as_view(), name="order-update"),
    path("saved-for-later/", SavedForLaterAPIView.as_view(), name="saved-for-later"),
    path("", include(router.urls)),
]
