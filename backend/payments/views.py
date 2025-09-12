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


# 4. Payment Intent (Stripe implementation)
class PaymentIntentAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            from django.conf import settings
            from store.models import Order

            # Check if Stripe keys are configured
            if not settings.STRIPE_SECRET_KEY:
                return Response(
                    {
                        "error": "Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables."
                    },
                    status=500,
                )

            import stripe

            stripe.api_key = settings.STRIPE_SECRET_KEY

            data = request.data
            order_id = data.get("order_id")
            if not order_id:
                return Response({"error": "order_id is required."}, status=400)

            try:
                order = Order.objects.get(id=order_id, order_user__user=request.user)
            except Order.DoesNotExist:
                return Response({"error": "Order not found."}, status=404)

            amount = int(
                float(order.total_amount) * 100
            )  # in cents, assuming INR, but Stripe uses cents
            currency = data.get("currency", "inr")

            # Create PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                automatic_payment_methods={"enabled": True},
            )

            # Create Payment record
            from payments.models import Payment

            payment = Payment.objects.create(
                user=request.user,
                seller=(
                    order.order_items.first().seller
                    if order.order_items.exists()
                    else None
                ),  # assuming single seller for simplicity
                order=order,
                amount=order.total_amount,
                currency=currency.upper(),
                transaction_id=intent.id,
                status="pending",
            )

            return Response(
                {"clientSecret": intent["client_secret"], "payment_id": payment.id}
            )
        except Exception as e:
            return Response({"error": str(e)}, status=400)


# 5. Special Webhook (dummy implementation)
class PaymentWebhookAPIView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Here you would process the webhook from the payment gateway
        # For now, just log and return success
        return Response({"received": True, "data": request.data})
