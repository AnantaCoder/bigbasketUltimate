from django.urls import path , include
from store.views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"new-items", ItemViewSet, basename="item")

urlpatterns = [
    path('categories/', CategoryListAPIView.as_view(), name='category-view'),
    path('items/', ItemListCreateAPIView.as_view(), name='item-list-create'),
    path('items/<int:pk>/', ItemDetailAPIView.as_view(), name='item-detail'),
    path('cart/', CartItemAPIView.as_view(), name='cart-items'),

    # OrderUser endpoints
    path('order-users/', OrderUserListCreateAPIView.as_view(), name='orderuser-list-create'),
    path('order-users/<int:pk>/', OrderUserRetrieveUpdateDestroyAPIView.as_view(), name='orderuser-detail'),

    # OrderItem endpoints
    path('order-items/', OrderItemListCreateAPIView.as_view(), name='orderitem-list-create'),
    path('order-items/<int:pk>/', OrderItemRetrieveUpdateDestroyAPIView.as_view(), name='orderitem-detail'),

    # Order endpoints
    path('orders/', OrderListCreateAPIView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', OrderRetrieveUpdateDestroyAPIView.as_view(), name='order-detail'),
    path('search-address/', SearchAddressAPIView.as_view(), name='search-address'),
     path("", include(router.urls)),
]
