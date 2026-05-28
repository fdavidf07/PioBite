"""
Rutas de pedidos y franjas horarias.

Incluye:
- rutas públicas/clientes
- rutas privadas del panel cafetería
"""

from django.urls import path

from .views import (
    TimeSlotListView,
    OrderCreateView,
    MyOrdersView,
    AdminOrdersView,
    OrderStatusUpdateView,
    VerifyOrderView,
    StaffTimeSlotListCreateView,
    StaffTimeSlotDetailView,
    StaffOrdersView,
    StaffOrderStatusUpdateView,
)

urlpatterns = [
    # Rutas públicas / cliente
    path("timeslots/", TimeSlotListView.as_view(), name="timeslot-list"),
    path("orders/", OrderCreateView.as_view(), name="order-create"),
    path("orders/my-orders/", MyOrdersView.as_view(), name="my-orders"),

    # Rutas antiguas de admin/cafetería
    path("orders/admin/", AdminOrdersView.as_view(), name="admin-orders"),
    path("orders/<int:pk>/status/", OrderStatusUpdateView.as_view(), name="order-status"),
    path("orders/verify/<str:code>/", VerifyOrderView.as_view(), name="verify-order"),

    # Rutas nuevas del panel cafetería
    path(
        "staff/timeslots/",
        StaffTimeSlotListCreateView.as_view(),
        name="staff-timeslot-list-create",
    ),
    path(
        "staff/timeslots/<int:pk>/",
        StaffTimeSlotDetailView.as_view(),
        name="staff-timeslot-detail",
    ),
    path(
        "staff/orders/",
        StaffOrdersView.as_view(),
        name="staff-orders",
    ),
    path(
        "staff/orders/<int:pk>/status/",
        StaffOrderStatusUpdateView.as_view(),
        name="staff-order-status",
    ),
]