from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsSuperUser
from accounts.models import User, Seller
from store.models import Item, Order
from rest_framework import status


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get(self, request):
        try:
            users_count = User.objects.count()
            sellers_count = Seller.objects.count()
            products_count = Item.objects.count()
            orders_count = Order.objects.count()

            data = {
                "users": users_count,
                "sellers": sellers_count,
                "products": products_count,
                "orders": orders_count,
            }
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"detail": "Error fetching dashboard stats", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
