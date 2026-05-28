"""
Vistas de pedidos para PíoBite.

Incluye:
- listado público de franjas horarias
- creación de pedidos por clientes
- historial del usuario
- gestión privada de pedidos y horarios para cafetería
"""

from datetime import date

from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsCafeteriaStaff
from .models import TimeSlot, Order
from .serializers import (
    TimeSlotSerializer,
    OrderCreateSerializer,
    OrderReadSerializer,
    OrderStatusUpdateSerializer,
)


def is_cafeteria_staff(user):
    """
    Comprueba si el usuario puede acceder al panel de cafetería.
    """

    return user.is_authenticated and (
        user.is_staff or getattr(user, "role", None) == "staff"
    )


class TimeSlotListView(generics.ListAPIView):
    """
    Lista pública de franjas horarias activas.

    URL:
    GET /api/timeslots/
    """

    serializer_class = TimeSlotSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return TimeSlot.objects.filter(is_active=True).order_by("start_time")

    def get_serializer_context(self):
        context = super().get_serializer_context()

        pickup_date = self.request.query_params.get("pickup_date")

        if not pickup_date:
            pickup_date = date.today()

        context["pickup_date"] = pickup_date

        return context


class OrderCreateView(generics.CreateAPIView):
    """
    Crea un pedido para el usuario autenticado.

    URL:
    POST /api/orders/
    """

    serializer_class = OrderCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = serializer.save()

        read_serializer = OrderReadSerializer(
            order,
            context={"request": request},
        )

        return Response(read_serializer.data, status=status.HTTP_201_CREATED)


class MyOrdersView(generics.ListAPIView):
    """
    Lista los pedidos del usuario autenticado.

    URL:
    GET /api/orders/my-orders/
    """

    serializer_class = OrderReadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user,
        ).select_related(
            "time_slot",
            "user",
        ).prefetch_related(
            "items__product__category",
        ).order_by("-created_at")


class AdminOrdersView(generics.ListAPIView):
    """
    Lista todos los pedidos para personal de cafetería.

    Filtros opcionales:
    - ?status=pending
    - ?pickup_date=2026-01-01
    - ?payment_status=paid

    URL:
    GET /api/orders/admin/
    """

    serializer_class = OrderReadSerializer
    permission_classes = [IsCafeteriaStaff]

    def get_queryset(self):
        queryset = Order.objects.select_related(
            "time_slot",
            "user",
        ).prefetch_related(
            "items__product__category",
        ).order_by("-created_at")

        order_status = self.request.query_params.get("status")
        pickup_date = self.request.query_params.get("pickup_date")
        payment_status = self.request.query_params.get("payment_status")

        if order_status:
            queryset = queryset.filter(status=order_status)

        if pickup_date:
            queryset = queryset.filter(pickup_date=pickup_date)

        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)

        return queryset


class OrderStatusUpdateView(APIView):
    """
    Actualiza el estado de un pedido desde cafetería.

    URL:
    PATCH /api/orders/<id>/status/
    """

    permission_classes = [IsCafeteriaStaff]

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)

        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order.status = serializer.validated_data["status"]
        order.save()

        read_serializer = OrderReadSerializer(
            order,
            context={"request": request},
        )

        return Response(read_serializer.data)


class VerifyOrderView(APIView):
    """
    Verifica un pedido por código.

    URL:
    GET /api/orders/verify/PB-XXXXXX/
    """

    permission_classes = [IsCafeteriaStaff]

    def get(self, request, code):
        order = get_object_or_404(
            Order.objects.select_related(
                "time_slot",
                "user",
            ).prefetch_related(
                "items__product__category",
            ),
            code=code.upper(),
        )

        serializer = OrderReadSerializer(
            order,
            context={"request": request},
        )

        return Response(serializer.data)


class StaffTimeSlotListCreateView(generics.ListCreateAPIView):
    """
    Gestión de franjas horarias para cafetería.

    URL:
    GET  /api/staff/timeslots/
    POST /api/staff/timeslots/
    """

    queryset = TimeSlot.objects.all().order_by("start_time")
    serializer_class = TimeSlotSerializer
    permission_classes = [IsCafeteriaStaff]


class StaffTimeSlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Editar o borrar una franja horaria desde cafetería.

    URL:
    GET    /api/staff/timeslots/<id>/
    PUT    /api/staff/timeslots/<id>/
    PATCH  /api/staff/timeslots/<id>/
    DELETE /api/staff/timeslots/<id>/
    """

    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsCafeteriaStaff]


class StaffOrdersView(AdminOrdersView):
    """
    Alias limpio para pedidos del panel cafetería.

    URL:
    GET /api/staff/orders/
    """

    pass


class StaffOrderStatusUpdateView(OrderStatusUpdateView):
    """
    Alias limpio para cambiar estado desde panel cafetería.

    URL:
    PATCH /api/staff/orders/<id>/status/
    """

    pass