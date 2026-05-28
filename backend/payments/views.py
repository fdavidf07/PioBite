"""
Vistas de pagos para PíoBite.

Incluyen:
- Crear operación Redsys TEST para un pedido
- Recibir notificación de Redsys
- Gestionar retorno OK / KO
"""

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from .redsys import build_redsys_payment, decode_redsys_response, verify_redsys_signature


class CreateRedsysPaymentView(APIView):
    """
    Prepara un pago Redsys para un pedido del usuario autenticado.

    URL:
    POST /api/payments/redsys/create/
    Body:
    {
      "order_id": 1
    }
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")

        if not order_id:
            return Response(
                {"detail": "Falta order_id."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {"detail": "Pedido no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.payment_status == Order.PAYMENT_STATUS_PAID:
            return Response(
                {"detail": "Este pedido ya está pagado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payment_data = build_redsys_payment(order)
        except ValueError as error:
            return Response(
                {"detail": str(error)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        order.payment_method = Order.PAYMENT_METHOD_REDSYS_TEST
        order.payment_status = Order.PAYMENT_STATUS_PENDING
        order.redsys_order = payment_data["redsys_order"]
        order.save()

        return Response(payment_data)


@method_decorator(csrf_exempt, name="dispatch")
class RedsysNotificationView(APIView):
    """
    Recibe la notificación online de Redsys.

    Redsys enviará Ds_MerchantParameters, Ds_Signature y Ds_SignatureVersion.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        merchant_parameters = request.data.get("Ds_MerchantParameters")
        signature = request.data.get("Ds_Signature")

        if not merchant_parameters or not signature:
            return HttpResponse("Faltan parámetros", status=400)

        is_valid, decoded = verify_redsys_signature(merchant_parameters, signature)

        if not is_valid:
            return HttpResponse("Firma KO", status=400)

        redsys_order = (
            decoded.get("Ds_Order")
            or decoded.get("DS_ORDER")
            or decoded.get("Ds_Merchant_Order")
            or decoded.get("DS_MERCHANT_ORDER")
        )

        response_code = (
            decoded.get("Ds_Response")
            or decoded.get("DS_RESPONSE")
            or decoded.get("Ds_Merchant_Response")
            or decoded.get("DS_MERCHANT_RESPONSE")
        )

        if not redsys_order:
            return HttpResponse("Pedido Redsys no encontrado", status=400)

        try:
            order = Order.objects.get(redsys_order=redsys_order)
        except Order.DoesNotExist:
            return HttpResponse("Pedido interno no encontrado", status=404)

        order.redsys_response_code = response_code

        try:
            numeric_response = int(response_code)
        except (TypeError, ValueError):
            numeric_response = 9999

        if 0 <= numeric_response <= 99:
            order.payment_status = Order.PAYMENT_STATUS_PAID
        else:
            order.payment_status = Order.PAYMENT_STATUS_FAILED

        order.save()

        return HttpResponse("OK")


class RedsysOkView(APIView):
    """
    Retorno visual cuando Redsys devuelve operación OK.

    En local esto solo redirige al frontend. La actualización real del pago
    la hace la notificación online si Redsys puede llegar al backend.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return redirect(f"{settings.FRONTEND_URL}")


class RedsysKoView(APIView):
    """
    Retorno visual cuando Redsys devuelve operación KO.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return redirect(f"{settings.FRONTEND_URL}")