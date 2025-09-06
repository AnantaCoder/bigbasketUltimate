from django.shortcuts import render
from accounts.models import User, Seller
from store.models import Item, Category, Cart, OrderUser, OrderItem, Order
from store.serializers import ItemSerializer, CategorySerializer, CartSerializer, OrderUserSerializer, OrderItemSerializer, OrderSerializer
from rest_framework.views import APIView
from rest_framework import status, response, permissions, serializers
from rest_framework.response import Response
from django.db.models import Q
from store.permissions import IsSellerOrReadOnly
from django.http import Http404
from rest_framework import generics

class CategoryListAPIView(APIView):
    
    permission_classes = [permissions.AllowAny]
    
    def get(self,request,format=None):
        categories = Category.objects.filter(is_active=True)
        serializer = CategorySerializer(categories , many=True)
        return response.Response(serializer.data)
    
    
# views for single category will be there as well 
class ItemListCreateAPIView(APIView):
   
    permission_classes = [permissions.AllowAny]

    def get(self, request, format=None):
        
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'seller'):
            items = Item.objects.filter(seller=user.seller)
        else:
            items = Item.objects.filter(is_active=True, is_in_stock=True)
        
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        """
        Create a new item, assigning it to the logged-in seller.
        """
        serializer = ItemSerializer(data=request.data)
        if serializer.is_valid():
            # The permission class ensures request.user.seller exists.
            serializer.save(seller=request.user.seller)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        # Manually check object-level permissions for write operations
        self.check_object_permissions(request, item)
        serializer = ItemSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        item = self.get_object(pk)
        # Manually check object-level permissions for write operations
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
        if hasattr(user, 'seller'):
            return Response({'detail': 'Sellers cannot access cart.'}, status=status.HTTP_403_FORBIDDEN)
        cart, _ = Cart.objects.get_or_create(user=user, seller=None)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request, format=None):
        user = request.user
        if hasattr(user, 'seller'):
            return Response({'detail': 'Sellers cannot add to cart.'}, status=status.HTTP_403_FORBIDDEN)
        cart, _ = Cart.objects.get_or_create(user=user, seller=None)
        serializer = CartSerializer(cart, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, format=None):
        user = request.user
        if hasattr(user, 'seller'):
            return Response({'detail': 'Sellers cannot delete from cart.'}, status=status.HTTP_403_FORBIDDEN)
        cart = Cart.objects.filter(user=user, seller=None).first()
        if not cart:
            return Response({'detail': 'Cart not found.'}, status=status.HTTP_404_NOT_FOUND)
        item_ids = request.data.get('item_ids', [])
        if item_ids:
            cart.items.remove(*item_ids)
            cart.save()
            return Response({'detail': 'Items removed from cart.'}, status=status.HTTP_200_OK)
        return Response({'detail': 'No item_ids provided.'}, status=status.HTTP_400_BAD_REQUEST)
    
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
        original_item = serializer.validated_data.get('original_item')
        if not original_item:
            raise serializers.ValidationError({'original_item_id': 'This field is required.'})
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
