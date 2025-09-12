from django.urls import path
from payments.views import (
	PaymentListCreateAPIView, PaymentRetrieveUpdateDestroyAPIView,
	PaymentStatusAPIView, PaymentGatewayLogListCreateAPIView, PaymentGatewayLogRetrieveAPIView,
	PaymentIntentAPIView, PaymentWebhookAPIView
)

urlpatterns = [
	# Payment CRUD
	path('payments/', PaymentListCreateAPIView.as_view(), name='payment-list-create'),
	path('payments/<int:pk>/', PaymentRetrieveUpdateDestroyAPIView.as_view(), name='payment-detail'),

	# Payment status
	path('payments/<int:pk>/status/', PaymentStatusAPIView.as_view(), name='payment-status'),

	# PaymentGatewayLog CRUD
	path('gateway-logs/', PaymentGatewayLogListCreateAPIView.as_view(), name='gatewaylog-list-create'),
	path('gateway-logs/<int:pk>/', PaymentGatewayLogRetrieveAPIView.as_view(), name='gatewaylog-detail'),

	# Payment intent
	path('create-payment-intent/', PaymentIntentAPIView.as_view(), name='create-payment-intent'),

	# Special webhook
	path('webhook/', PaymentWebhookAPIView.as_view(), name='payment-webhook'),
]
