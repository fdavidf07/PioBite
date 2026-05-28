"""
Configuración de pedidos en el panel de administración.

Permite gestionar franjas horarias, pedidos, líneas de pedido y campos
relacionados con el pago Redsys TEST.
"""

from django.contrib import admin
from .models import TimeSlot, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "label",
        "start_time",
        "end_time",
        "max_orders",
        "is_active",
    )

    list_filter = ("is_active",)
    search_fields = ("label",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "code",
        "user",
        "pickup_date",
        "time_slot",
        "status",
        "total_price",
        "payment_method",
        "payment_status",
        "redsys_order",
        "redsys_response_code",
        "created_at",
    )

    list_filter = (
        "status",
        "payment_method",
        "payment_status",
        "pickup_date",
        "time_slot",
    )

    search_fields = (
        "code",
        "redsys_order",
        "user__username",
        "user__email",
    )

    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "product",
        "quantity",
        "unit_price",
    )

    search_fields = (
        "order__code",
        "product__name",
    )