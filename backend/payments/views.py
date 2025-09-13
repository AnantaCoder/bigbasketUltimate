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


# 4. Razorpay Order Creation
class RazorpayOrderAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            from django.conf import settings
            from store.models import Order

            # Check if Razorpay keys are configured
            if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
                return Response(
                    {
                        "error": "Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables."
                    },
                    status=500,
                )

            import razorpay

            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

            data = request.data
            order_id = data.get("order_id")
            if not order_id:
                return Response({"error": "order_id is required."}, status=400)

            try:
                order = Order.objects.get(id=order_id, order_user__user=request.user)
            except Order.DoesNotExist:
                return Response({"error": "Order not found."}, status=404)

            amount = int(float(order.total_amount) * 100)  # in paisa
            currency = "INR"

            # Create Razorpay Order
            razorpay_order = client.order.create({
                "amount": amount,
                "currency": currency,
                "payment_capture": 1,  # Auto capture
            })

            # Create Payment record
            from payments.models import Payment

            payment = Payment.objects.create(
                user=request.user,
                seller=(
                    order.order_items.first().seller
                    if order.order_items.exists()
                    else None
                ),
                order=order,
                amount=order.total_amount,
                currency=currency,
                transaction_id=razorpay_order["id"],
                status="pending",
            )

            return Response({
                "order_id": razorpay_order["id"],
                "amount": razorpay_order["amount"],
                "currency": razorpay_order["currency"],
                "key": settings.RAZORPAY_KEY_ID,
                "payment_id": payment.id
            })
        except Exception as e:
            return Response({"error": str(e)}, status=400)


# 5. Razorpay Payment Verification
class RazorpayVerifyAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            from django.conf import settings
            import razorpay
            import hmac
            import hashlib

            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

            data = request.data
            razorpay_order_id = data.get("razorpay_order_id")
            razorpay_payment_id = data.get("razorpay_payment_id")
            razorpay_signature = data.get("razorpay_signature")

            if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
                return Response({"error": "Missing required fields."}, status=400)

            # Verify signature
            generated_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode(),
                f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
                hashlib.sha256
            ).hexdigest()

            if generated_signature != razorpay_signature:
                return Response({"error": "Invalid signature."}, status=400)

            # Fetch payment details
            payment_details = client.payment.fetch(razorpay_payment_id)

            # Update Payment record
            try:
                payment = Payment.objects.get(transaction_id=razorpay_order_id)
                payment.status = "success" if payment_details["status"] == "captured" else "failed"
                payment.is_success = payment.status == "success"
                payment.save()

                # Log the gateway response
                PaymentGatewayLog.objects.create(
                    payment_id=razorpay_payment_id,
                    gateway_response=payment_details
                )

                return Response({"status": payment.status, "payment_id": payment.id})
            except Payment.DoesNotExist:
                return Response({"error": "Payment record not found."}, status=404)

        except Exception as e:
            return Response({"error": str(e)}, status=400)


# 6. Special Webhook (dummy implementation)
class PaymentWebhookAPIView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Here you would process the webhook from the payment gateway
        # For now, just log and return success
        return Response({"received": True, "data": request.data})
