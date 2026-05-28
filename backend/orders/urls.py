"""
Rutas de pedidos y franjas horarias.
"""

from django.urls import path

from .views import (
    TimeSlotListView,
    OrderCreateView,
    MyOrdersView,
    AdminOrdersView,
    OrderStatusUpdateView,
    VerifyOrderView,
)

urlpatterns = [
    path("timeslots/", TimeSlotListView.as_view(), name="timeslot-list"),

    path("orders/", OrderCreateView.as_view(), name="order-create"),
    path("orders/my-orders/", MyOrdersView.as_view(), name="my-orders"),
    path("orders/admin/", AdminOrdersView.as_view(), name="admin-orders"),
    path("orders/<int:pk>/status/", OrderStatusUpdateView.as_view(), name="order-status"),
    path("orders/verify/<str:code>/", VerifyOrderView.as_view(), name="verify-order"),
]