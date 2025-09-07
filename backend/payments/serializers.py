
from rest_framework import serializers
from payments.models import Payment, PaymentGatewayLog

class PaymentGatewayLogSerializer(serializers.ModelSerializer):
	class Meta:
		model = PaymentGatewayLog
		fields = ['id', 'payment_id', 'gateway_response', 'timestamp']
		read_only_fields = ['id', 'timestamp']

class PaymentSerializer(serializers.ModelSerializer):
	gateway_log = PaymentGatewayLogSerializer(read_only=True)
	gateway_log_id = serializers.PrimaryKeyRelatedField(
		queryset=PaymentGatewayLog.objects.all(),
		source='gateway_log',
		write_only=True,
		required=False,
		allow_null=True
	)

	class Meta:
		model = Payment
		fields = [
			'id', 'user', 'seller', 'order', 'amount', 'currency', 'status',
			'transaction_id', 'is_success', 'gateway_log', 'gateway_log_id',
			'created_at', 'updated_at'
		]
		read_only_fields = ['id', 'created_at', 'updated_at', 'gateway_log']
