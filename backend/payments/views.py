
from rest_framework import generics, status, permissions, views, response
from payments.models import Payment, PaymentGatewayLog
from payments.serializers import PaymentSerializer, PaymentGatewayLogSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

# 1. Payment CRUD
class PaymentListCreateAPIView(generics.ListCreateAPIView):
	queryset = Payment.objects.all()
	serializer_class = PaymentSerializer
	permission_classes = [permissions.IsAuthenticated]

class PaymentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Payment.objects.all()
	serializer_class = PaymentSerializer
	permission_classes = [permissions.IsAuthenticated]

# 2. Get payment status
class PaymentStatusAPIView(views.APIView):
	permission_classes = [permissions.IsAuthenticated]
	def get(self, request, pk):
		payment = get_object_or_404(Payment, pk=pk)
		return Response({"status": payment.status, "is_success": payment.is_success})

# 3. PaymentGatewayLog CRUD (list, create, retrieve)
class PaymentGatewayLogListCreateAPIView(generics.ListCreateAPIView):
	queryset = PaymentGatewayLog.objects.all()
	serializer_class = PaymentGatewayLogSerializer
	permission_classes = [permissions.IsAuthenticated]

class PaymentGatewayLogRetrieveAPIView(generics.RetrieveAPIView):
	queryset = PaymentGatewayLog.objects.all()
	serializer_class = PaymentGatewayLogSerializer
	permission_classes = [permissions.IsAuthenticated]

# 4. Payment Intent (dummy implementation)
class PaymentIntentAPIView(views.APIView):
	permission_classes = [permissions.IsAuthenticated]
	def post(self, request):
		# Here you would integrate with a real payment gateway
		# For now, just return a dummy intent
		return Response({"intent": "dummy_intent_id", "client_secret": "dummy_secret"})

# 5. Special Webhook (dummy implementation)
class PaymentWebhookAPIView(views.APIView):
	permission_classes = [permissions.AllowAny]
	def post(self, request):
		# Here you would process the webhook from the payment gateway
		# For now, just log and return success
		return Response({"received": True, "data": request.data})
