from django.shortcuts import render
from accounts.models import User, Seller
from store.models import Item , Category
from store.serializers import ItemSerializer , CategorySerializer
from rest_framework.views import APIView
from rest_framework import status , response , permissions
from rest_framework.response import Response
from django.db.models import Q
from store.permissions import IsSellerOrReadOnly
from django.http import Http404
# Create your views here.

class CategoryListAPIView(APIView):
    
    permission_classes = [permissions.AllowAny]
    
    def get(self,request,format=None):
        categories = Category.objects.filter(is_active=True)
        serializer = CategorySerializer(categories , many=True)
        return response.Response(serializer.data)
    
    
# views for single category will be there as well 
class ItemListCreateAPIView(APIView):
   
    permission_classes = [IsSellerOrReadOnly]

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
    """ get to see all items , post add to cart  , delete delete from cart , 
    make sure user is not seller  . 
    """