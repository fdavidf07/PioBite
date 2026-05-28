"""
Utilidades para generar y validar operaciones Redsys.

Este archivo prepara los campos necesarios para una operación por redirección:
- Ds_SignatureVersion
- Ds_MerchantParameters
- Ds_Signature

La firma sigue el sistema HMAC_SHA512_V2 de Redsys:
1. Los parámetros se codifican en Base64URL.
2. La clave de firma del terminal se recorta/rellena a 16 caracteres.
3. Se cifra el número de pedido con AES-CBC e IV de ceros.
4. El resultado AES se codifica en Base64.
5. Esa clave Base64 se usa para calcular HMAC SHA-512.
6. La firma final se codifica en Base64URL.
"""

import base64
import hashlib
import hmac
import json
from decimal import Decimal, ROUND_HALF_UP

from Crypto.Cipher import AES
from django.conf import settings


def _base64url_encode(data_bytes):
    """
    Codifica bytes en Base64URL sin el relleno final '='.
    Redsys usa Base64URL para Ds_MerchantParameters y Ds_Signature.
    """

    return base64.urlsafe_b64encode(data_bytes).decode("utf-8").rstrip("=")


def _base64url_decode(data):
    """
    Decodifica Base64URL añadiendo padding '=' si hace falta.
    """

    clean_data = data.strip()

    missing_padding = len(clean_data) % 4

    if missing_padding:
        clean_data += "=" * (4 - missing_padding)

    return base64.urlsafe_b64decode(clean_data.encode("utf-8"))


def _prepare_redsys_key():
    """
    Prepara la clave de firma del terminal.

    Redsys indica que para HMAC_SHA512_V2:
    - Si la clave tiene más de 16 caracteres, se usan los primeros 16.
    - Si tiene menos de 16, se rellena con ceros por la derecha.
    """

    key = settings.REDSYS_SECRET_KEY.strip()
    key = key.replace(" ", "").replace("\n", "").replace("\r", "")

    if len(key) > 16:
        key = key[:16]

    if len(key) < 16:
        key = key.ljust(16, "0")

    return key.encode("utf-8")


def _pkcs7_pad_to_16(data):
    """
    AES trabaja en bloques de 16 bytes.

    Redsys necesita que el número de pedido se rellene hasta múltiplo de 16.
    Usamos relleno PKCS#7, que es el que reproduce los ejemplos oficiales.
    """

    data_bytes = data.encode("utf-8")
    padding_length = 16 - (len(data_bytes) % 16)

    if padding_length == 0:
        padding_length = 16

    return data_bytes + bytes([padding_length]) * padding_length


def _get_merchant_key(order_number):
    """
    Genera la clave específica de la operación.

    Se cifra el número de pedido con AES-CBC usando IV de ceros.
    Después, el resultado cifrado se codifica en Base64.
    Esa cadena Base64 es la clave que se usa para el HMAC.
    """

    key = _prepare_redsys_key()
    iv = b"\0" * 16

    cipher = AES.new(key, AES.MODE_CBC, iv)
    encrypted_order = cipher.encrypt(_pkcs7_pad_to_16(order_number))

    return base64.b64encode(encrypted_order)


def _encode_parameters(parameters):
    """
    Convierte los parámetros a JSON minificado y después a Base64URL.
    """

    json_data = json.dumps(parameters, separators=(",", ":"))

    return _base64url_encode(json_data.encode("utf-8"))


def _decode_parameters(merchant_parameters):
    """
    Decodifica Ds_MerchantParameters desde Base64URL.
    """

    decoded = _base64url_decode(merchant_parameters).decode("utf-8")

    return json.loads(decoded)


def _create_signature(order_number, merchant_parameters):
    """
    Crea Ds_Signature usando HMAC SHA-512.
    """

    merchant_key = _get_merchant_key(order_number)

    signature = hmac.new(
        merchant_key,
        merchant_parameters.encode("utf-8"),
        hashlib.sha512,
    ).digest()

    return _base64url_encode(signature)


def _amount_to_cents(amount):
    """
    Convierte euros a céntimos.

    Ejemplos:
    1.00 -> 100
    3.50 -> 350
    """

    decimal_amount = Decimal(amount).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    return str(int(decimal_amount * 100))


def generate_redsys_order_number(order):
    """
    Genera un número de pedido válido para Redsys.

    Redsys acepta entre 4 y 12 caracteres.
    Usamos el ID del pedido y la hora de creación.
    """

    return f"{order.id:04d}{order.created_at.strftime('%H%M%S')}"[:12]


def build_redsys_payment(order):
    """
    Genera los datos que React enviará por formulario POST a Redsys.
    """

    if not settings.REDSYS_SECRET_KEY:
        raise ValueError("Falta REDSYS_SECRET_KEY en backend/.env")

    if not settings.REDSYS_MERCHANT_CODE:
        raise ValueError("Falta REDSYS_MERCHANT_CODE en backend/.env")

    redsys_order = order.redsys_order or generate_redsys_order_number(order)

    merchant_url = f"{settings.BACKEND_URL}/api/payments/redsys/notification/"
    url_ok = settings.FRONTEND_URL
    url_ko = settings.FRONTEND_URL

    parameters = {
        "DS_MERCHANT_AMOUNT": _amount_to_cents(order.total_price),
        "DS_MERCHANT_ORDER": redsys_order,
        "DS_MERCHANT_MERCHANTCODE": settings.REDSYS_MERCHANT_CODE,
        "DS_MERCHANT_CURRENCY": settings.REDSYS_CURRENCY,
        "DS_MERCHANT_TRANSACTIONTYPE": settings.REDSYS_TRANSACTION_TYPE,
        "DS_MERCHANT_TERMINAL": settings.REDSYS_TERMINAL,
        "DS_MERCHANT_MERCHANTURL": merchant_url,
        "DS_MERCHANT_URLOK": url_ok,
        "DS_MERCHANT_URLKO": url_ko,
        "DS_MERCHANT_PRODUCTDESCRIPTION": f"Pedido {order.code} - PioBite",
        "DS_MERCHANT_TITULAR": order.user.email or order.user.username,
    }

    merchant_parameters = _encode_parameters(parameters)
    signature = _create_signature(redsys_order, merchant_parameters)

    print("=== REDSYS DEBUG ===")
    print("URL:", settings.REDSYS_URL)
    print("Merchant code:", settings.REDSYS_MERCHANT_CODE)
    print("Terminal:", settings.REDSYS_TERMINAL)
    print("Order:", redsys_order)
    print("Amount:", _amount_to_cents(order.total_price))
    print("Key used first 16 chars:", settings.REDSYS_SECRET_KEY.strip()[:16])
    print("Parameters JSON:", parameters)
    print("Ds_MerchantParameters:", merchant_parameters)
    print("Ds_SignatureVersion:", settings.REDSYS_SIGNATURE_VERSION)
    print("Ds_Signature:", signature)
    print("====================")

    return {
        "redsys_url": settings.REDSYS_URL,
        "Ds_SignatureVersion": settings.REDSYS_SIGNATURE_VERSION,
        "Ds_MerchantParameters": merchant_parameters,
        "Ds_Signature": signature,
        "redsys_order": redsys_order,
    }


def decode_redsys_response(merchant_parameters):
    """
    Decodifica la respuesta enviada por Redsys.
    """

    return _decode_parameters(merchant_parameters)


def verify_redsys_signature(merchant_parameters, received_signature):
    """
    Verifica la firma recibida desde Redsys.
    """

    decoded = _decode_parameters(merchant_parameters)

    redsys_order = (
        decoded.get("Ds_Order")
        or decoded.get("DS_ORDER")
        or decoded.get("Ds_Merchant_Order")
        or decoded.get("DS_MERCHANT_ORDER")
    )

    if not redsys_order:
        return False, decoded

    calculated_signature = _create_signature(redsys_order, merchant_parameters)

    is_valid = hmac.compare_digest(calculated_signature, received_signature)

    return is_valid, decoded