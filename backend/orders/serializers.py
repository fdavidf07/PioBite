"""
Serializers de pedidos para PíoBite.

Definen cómo se crean pedidos, cómo se muestran sus productos,
cómo se representan franjas horarias y cómo se expone el estado de pago.
"""

from datetime import date
from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from catalog.models import Product
from catalog.serializers import ProductSerializer
from .models import TimeSlot, Order, OrderItem


class TimeSlotSerializer(serializers.ModelSerializer):
    current_orders = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()

    class Meta:
        model = TimeSlot
        fields = (
            "id",
            "label",
            "start_time",
            "end_time",
            "max_orders",
            "is_active",
            "current_orders",
            "is_full",
        )

    def _get_pickup_date(self):
        return self.context.get("pickup_date") or date.today()

    def get_current_orders(self, obj):
        pickup_date = self._get_pickup_date()

        return Order.objects.filter(
            pickup_date=pickup_date,
            time_slot=obj,
        ).exclude(
            status=Order.STATUS_CANCELLED,
        ).count()

    def get_is_full(self, obj):
        return self.get_current_orders(obj) >= obj.max_orders


class OrderItemReadSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "quantity",
            "unit_price",
            "subtotal",
        )

    def get_subtotal(self, obj):
        return obj.get_subtotal()


class OrderReadSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True, read_only=True)
    time_slot = TimeSlotSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_status_display = serializers.CharField(
        source="get_payment_status_display",
        read_only=True,
    )
    payment_method_display = serializers.CharField(
        source="get_payment_method_display",
        read_only=True,
    )
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "code",
            "username",
            "pickup_date",
            "time_slot",
            "status",
            "status_display",
            "total_price",
            "payment_method",
            "payment_method_display",
            "payment_status",
            "payment_status_display",
            "redsys_order",
            "redsys_response_code",
            "items",
            "created_at",
            "updated_at",
        )


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_available=True),
        source="product",
    )

    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    pickup_date = serializers.DateField()

    time_slot_id = serializers.PrimaryKeyRelatedField(
        queryset=TimeSlot.objects.filter(is_active=True),
        source="time_slot",
    )

    items = OrderItemCreateSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("El pedido debe tener al menos un producto.")

        return value

    def validate(self, attrs):
        pickup_date = attrs["pickup_date"]
        time_slot = attrs["time_slot"]

        current_orders = Order.objects.filter(
            pickup_date=pickup_date,
            time_slot=time_slot,
        ).exclude(
            status=Order.STATUS_CANCELLED,
        ).count()

        if current_orders >= time_slot.max_orders:
            raise serializers.ValidationError(
                "Esta franja horaria está completa. Elige otra."
            )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        items_data = validated_data["items"]

        order = Order.objects.create(
            user=user,
            pickup_date=validated_data["pickup_date"],
            time_slot=validated_data["time_slot"],
            total_price=Decimal("0.00"),
            payment_method=Order.PAYMENT_METHOD_NONE,
            payment_status=Order.PAYMENT_STATUS_PENDING,
        )

        total = Decimal("0.00")

        for item_data in items_data:
            product = item_data["product"]
            quantity = item_data["quantity"]
            unit_price = product.price

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=unit_price,
            )

            total += unit_price * quantity

        order.total_price = total
        order.save()

        return order


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)