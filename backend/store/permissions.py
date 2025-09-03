from rest_framework import permissions

class IsSellerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method is permissions.SAFE_METHODS:
            return True 
        
        return request.user.is_authenticated and hasattr(request.user , 'seller')

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller == request.user.seller