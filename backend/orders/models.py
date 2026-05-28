"""
Modelos de pedidos para PíoBite.

Un pedido pertenece a un usuario, tiene una fecha de recogida, una franja
horaria, un estado, un total y varias líneas con productos y cantidades.

También incluye campos de pago para preparar la integración con Redsys TEST.
"""

import uuid
from django.conf import settings
from django.db import models
from catalog.models import Product


class TimeSlot(models.Model):
    label = models.CharField(max_length=50)
    start_time = models.TimeField()
    end_time = models.TimeField()
    max_orders = models.PositiveIntegerField(default=10)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.label


class Order(models.Model):
    STATUS_PENDING = "pending"
    STATUS_PREPARING = "preparing"
    STATUS_READY = "ready"
    STATUS_DELIVERED = "delivered"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pendiente"),
        (STATUS_PREPARING, "Preparando"),
        (STATUS_READY, "Listo"),
        (STATUS_DELIVERED, "Entregado"),
        (STATUS_CANCELLED, "Cancelado"),
    ]

    PAYMENT_STATUS_PENDING = "pending"
    PAYMENT_STATUS_PAID = "paid"
    PAYMENT_STATUS_FAILED = "failed"
    PAYMENT_STATUS_CANCELLED = "cancelled"

    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_STATUS_PENDING, "Pendiente de pago"),
        (PAYMENT_STATUS_PAID, "Pagado"),
        (PAYMENT_STATUS_FAILED, "Pago fallido"),
        (PAYMENT_STATUS_CANCELLED, "Pago cancelado"),
    ]

    PAYMENT_METHOD_NONE = "none"
    PAYMENT_METHOD_REDSYS_TEST = "redsys_test"

    PAYMENT_METHOD_CHOICES = [
        (PAYMENT_METHOD_NONE, "Sin pago"),
        (PAYMENT_METHOD_REDSYS_TEST, "Redsys TEST"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
    )

    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
    )

    pickup_date = models.DateField()

    time_slot = models.ForeignKey(
        TimeSlot,
        on_delete=models.PROTECT,
        related_name="orders",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )

    total_price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
    )

    # Método de pago usado por el pedido
    payment_method = models.CharField(
        max_length=30,
        choices=PAYMENT_METHOD_CHOICES,
        default=PAYMENT_METHOD_NONE,
    )

    # Estado del pago
    payment_status = models.CharField(
        max_length=30,
        choices=PAYMENT_STATUS_CHOICES,
        default=PAYMENT_STATUS_PENDING,
    )

    # Número de operación enviado a Redsys
    redsys_order = models.CharField(
        max_length=12,
        blank=True,
        null=True,
        unique=True,
    )

    # Código de respuesta devuelto por Redsys
    redsys_response_code = models.CharField(
        max_length=10,
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = "PB-" + uuid.uuid4().hex[:6].upper()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.code} - {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
    )

    quantity = models.PositiveIntegerField(default=1)

    unit_price = models.DecimalField(
        max_digits=6,
        decimal_places=2,
    )

    def get_subtotal(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"