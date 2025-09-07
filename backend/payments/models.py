
from django.db import models
from accounts.models import User, Seller
from store.models import Order

# PaymentGatewayLog model
class PaymentGatewayLog(models.Model):
	payment_id = models.CharField(max_length=100, unique=True)
	gateway_response = models.JSONField()
	timestamp = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"GatewayLog {self.payment_id} at {self.timestamp}"

# Payment model
class Payment(models.Model):
	STATUS_CHOICES = [
		("pending", "Pending"),
		("success", "Success"),
		("failed", "Failed"),
		("cancelled", "Cancelled"),
	]
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payments")
	seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name="payments")
	order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payments")
	amount = models.DecimalField(max_digits=10, decimal_places=2)
	currency = models.CharField(max_length=10, default="INR")
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
	transaction_id = models.CharField(max_length=100, unique=True)
	is_success = models.BooleanField(default=False)
	gateway_log = models.ForeignKey(PaymentGatewayLog, on_delete=models.SET_NULL, null=True, blank=True, related_name="payments")
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Payment {self.id} - {self.status}"

