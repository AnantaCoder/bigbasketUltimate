from django.shortcuts import render
from accounts.models import User, Seller
from store.models import Item, Category, Cart, CartItem, OrderUser, OrderItem, Order
from store.serializers import (
    ItemSerializer,
    CategorySerializer,
    CartSerializer,
    OrderUserSerializer,
    OrderItemSerializer,
    OrderSerializer,
)
from rest_framework.views import APIView
from rest_framework import status, response, permissions, serializers
from rest_framework.response import Response
from django.db.models import Q
from store.permissions import IsSellerOrReadOnly
from django.http import Http404
from rest_framework import generics
from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Item
from .serializers import ItemSerializer
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend


class CategoryListAPIView(APIView):

    permission_classes = [permissions.AllowAny]

    def get(self, request, format=None):
        categories = Category.objects.filter(is_active=True, parent=None)
        serializer = CategorySerializer(categories, many=True)
        return response.Response(serializer.data)


# views for single category will be there as well
class ItemListCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, format=None):
        user = self.request.user
        if user.is_authenticated and hasattr(user, "seller"):
            items = Item.objects.filter(seller=user.seller)
        else:
            items = Item.objects.all()
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = ItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(seller=request.user.seller)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ItemViewSet(viewsets.ModelViewSet):

    permission_classes = [permissions.AllowAny]
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["category", "manufacturer", "item_type", "price", "is_active"]
    search_fields = ["item_name", "description", "manufacturer"]

    def perform_create(self, serializer):
        seller = self.request.user.seller
        serializer.save()

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by seller if provided
        seller_id = self.request.query_params.get("seller")
        if seller_id:
            queryset = queryset.filter(seller__user__id=seller_id)

        # Price range filtering
        min_price = self.request.query_params.get("price__gte")
        max_price = self.request.query_params.get("price__lte")

        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Sorting
        sort_param = self.request.query_params.get("sort")
        if sort_param:
            if sort_param == "price_asc":
                queryset = queryset.order_by("price")
            elif sort_param == "price_desc":
                queryset = queryset.order_by("-price")
            elif sort_param == "saving_desc":
                # Assuming there's a discount field or we calculate savings
                queryset = queryset.order_by(
                    "-price"
                )  # Placeholder - adjust based on your model
            elif sort_param == "saving_asc":
                queryset = queryset.order_by(
                    "price"
                )  # Placeholder - adjust based on your model
            elif sort_param == "percent_off_desc":
                # Assuming there's a discount_percentage field
                queryset = queryset.order_by(
                    "-price"
                )  # Placeholder - adjust based on your model
            else:
                # Default relevance sorting (by creation date or popularity)
                queryset = (
                    queryset.order_by("-created_at")
                    if hasattr(Item, "created_at")
                    else queryset
                )

        return queryset.distinct()




class ItemDetailAPIView(APIView):

    permission_classes = [IsSellerOrReadOnly]
    def get_object(self, pk):
        try:
            return Item.objects.get(pk=pk)
        except Item.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        item = self.get_object(pk)
        serializer = ItemSerializer(item)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        item = self.get_object(pk)
        self.check_object_permissions(request, item)
        serializer = ItemSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, format=None):
        item = self.get_object(pk)
        self.check_object_permissions(request, item)
        serializer = ItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        item = self.get_object(pk)
        self.check_object_permissions(request, item)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartItemAPIView(APIView):
    """
    GET: List all cart items for the authenticated user (not seller)
    POST: Add items to cart
    DELETE: Remove items from cart
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        if hasattr(user, "seller"):
            return Response(
                {"detail": "Sellers cannot access cart."},
                status=status.HTTP_403_FORBIDDEN,
            )
        cart, _ = Cart.objects.get_or_create(user=user, seller=None)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request, format=None):
        try:
            user = request.user
            if hasattr(user, "seller"):
                return Response(
                    {"detail": "Sellers cannot add to cart.", "user_type": "seller"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            cart, created = Cart.objects.get_or_create(user=user, seller=None)
            item_ids = request.data.get("item_ids", [])
            quantities = request.data.get("quantities", [])
            if item_ids:
                # Validate item_ids and quantities length
                if quantities and len(quantities) != len(item_ids):
                    return Response(
                        {
                            "detail": "Length of quantities must match length of item_ids."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                # Create or update CartItem instances
                for idx, item_id in enumerate(item_ids):
                    quantity = quantities[idx] if quantities else 1
                    item = Item.objects.filter(id=item_id).first()
                    if not item:
                        return Response(
                            {"detail": f"Item with id {item_id} not found."},
                            status=status.HTTP_404_NOT_FOUND,
                        )
                    cart_item, created = CartItem.objects.get_or_create(
                        cart=cart, item=item
                    )
                    cart_item.quantity = quantity
                    cart_item.save()
                serializer = CartSerializer(cart)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(
                {"detail": "No item_ids provided.", "received_data": request.data},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, format=None):
        user = request.user
        if hasattr(user, "seller"):
            return Response(
                {"detail": "Sellers cannot delete from cart."},
                status=status.HTTP_403_FORBIDDEN,
            )
        cart = Cart.objects.filter(user=user, seller=None).first()
        if not cart:
            return Response(
                {"detail": "Cart not found."}, status=status.HTTP_404_NOT_FOUND
            )
        item_ids = request.data.get("item_ids", [])
        if item_ids:
            # Remove CartItem instances for the specified items
            CartItem.objects.filter(cart=cart, item_id__in=item_ids).delete()
            return Response(
                {"detail": "Items removed from cart."}, status=status.HTTP_200_OK
            )
        return Response(
            {"detail": "No item_ids provided."}, status=status.HTTP_400_BAD_REQUEST
        )

    def patch(self, request, format=None):
        """Update quantity of an item in cart"""
        user = request.user
        if hasattr(user, "seller"):
            return Response(
                {"detail": "Sellers cannot update cart."},
                status=status.HTTP_403_FORBIDDEN,
            )
        cart = Cart.objects.filter(user=user, seller=None).first()
        if not cart:
            return Response(
                {"detail": "Cart not found."}, status=status.HTTP_404_NOT_FOUND
            )
        item_id = request.data.get("item_id")
        quantity = request.data.get("quantity")
        if not item_id or quantity is None:
            return Response(
                {"detail": "item_id and quantity are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            cart_item = CartItem.objects.get(cart=cart, item_id=item_id)
            cart_item.quantity = quantity
            cart_item.save()
            serializer = CartSerializer(cart)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Item not found in cart."}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# OrderUser CRUD
class OrderUserListCreateAPIView(generics.ListCreateAPIView):
    queryset = OrderUser.objects.all()
    serializer_class = OrderUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OrderUserRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OrderUser.objects.all()
    serializer_class = OrderUserSerializer
    permission_classes = [permissions.IsAuthenticated]


# OrderItem CRUD


class OrderItemListCreateAPIView(generics.ListCreateAPIView):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        original_item = serializer.validated_data.get("original_item")
        if not original_item:
            raise serializers.ValidationError(
                {"original_item_id": "This field is required."}
            )
        serializer.save(seller=original_item.seller)


class OrderItemRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]


# Order CRUD
class OrderListCreateAPIView(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]


class OrderRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]


class CheckoutAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        user = request.user

        if hasattr(user, "seller"):
            return Response(
                {"detail": "Sellers cannot place orders.", "user_type": "seller"},
                status=status.HTTP_403_FORBIDDEN,
            )

        cart = Cart.objects.filter(user=user, seller=None).first()
        if not cart or not cart.cart_items.exists():
            return Response(
                {"detail": "Cart is empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order_user_id = request.data.get("order_user_id")
        if not order_user_id:
            return Response(
                {"detail": "order_user_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order_user = OrderUser.objects.get(id=order_user_id, user=user)
        except OrderUser.DoesNotExist:
            return Response(
                {"detail": "Invalid order_user_id."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create OrderItems from CartItems
        order_items = []
        total_amount = 0
        for cart_item in cart.cart_items.all():
            if cart_item.quantity > cart_item.item.quantity:
                return Response(
                    {"detail": f"Insufficient stock for {cart_item.item.item_name}. Available: {cart_item.item.quantity}, requested: {cart_item.quantity}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            order_item = OrderItem.objects.create(
                item_name=cart_item.item.item_name,
                price=cart_item.item.price,
                quantity=cart_item.quantity,
                seller=cart_item.item.seller,
                original_item=cart_item.item,
            )
            order_items.append(order_item)
            total_amount += order_item.total_price

            # Reduce inventory
            cart_item.item.quantity -= cart_item.quantity
            cart_item.item.save()

        # Create Order
        order = Order.objects.create(
            buyer_email=user.email, total_amount=total_amount, order_user=order_user
        )
        order.order_items.set(order_items)

        # Clear cart
        cart.cart_items.all().delete()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SearchAddressAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, format=None):
        query = request.GET.get("q", "")
        if not query:
            return Response({"results": []})
        # Mock search results for demonstration
        results = [
            {"id": 1, "name": "Bangalore, Karnataka", "pincode": "560001"},
            {"id": 3, "name": "Mysore, Karnataka", "pincode": "570001"},
        ]
        filtered_results = [
            r
            for r in results
            if query.lower() in r["name"].lower() or query in r["pincode"]
        ]
        return Response({"results": filtered_results})


# User Order History
class UserOrderListAPIView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.filter(order_user__user=user)
        status_filter = self.request.query_params.get("status")
        if status_filter == "active":
            queryset = queryset.filter(status__in=["pending", "processing", "shipped"])
        elif status_filter == "past":
            queryset = queryset.filter(status__in=["delivered", "cancelled"])
        return queryset.order_by("-created_at")


# Seller Order List
class SellerOrderListAPIView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, "seller"):
            return Order.objects.none()
        # Orders that have items from this seller
        return Order.objects.filter(order_items__seller=user.seller).distinct().order_by("-created_at")


# Order Update (for admin/seller to update status and tracking)
class OrderUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:  # Admin can update all
            return Order.objects.all()
        elif hasattr(user, "seller"):  # Seller can update orders with their items
            return Order.objects.filter(order_items__seller=user.seller).distinct()
        else:
            return Order.objects.none()

    def perform_update(self, serializer):
        instance = serializer.save()
        # Auto-set timestamps based on status
        from django.utils import timezone
        if instance.status == "shipped" and not instance.shipped_at:
            instance.shipped_at = timezone.now()
            instance.save()
        elif instance.status == "delivered" and not instance.delivered_at:
            instance.delivered_at = timezone.now()
            instance.save()
