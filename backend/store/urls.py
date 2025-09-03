from django.urls import path 
from store.views import *


urlpatterns = [
    path('categories/',CategoryListAPIView.as_view(),name='category-view'),
    path('items/',ItemListCreateAPIView.as_view(),name='item-list-create'),
    path('items/<int:pk>/',ItemDetailAPIView.as_view(),name='item-detail'),
]
