"""
Vistas de autenticación para PíoBite.

Incluye:
- Registro simple
- Usuario actual
- Login con Google
"""

from django.conf import settings
from django.contrib.auth import get_user_model

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer


User = get_user_model()


def build_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


def build_username_from_email(email):
    base_username = email.split("@")[0]
    username = base_username
    counter = 1

    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1

    return username


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        credential = request.data.get("credential")

        if not credential:
            return Response(
                {"detail": "Falta la credencial de Google."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            google_user = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError:
            return Response(
                {"detail": "Token de Google no válido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = google_user.get("email")
        first_name = google_user.get("given_name", "")
        last_name = google_user.get("family_name", "")

        if not email:
            return Response(
                {"detail": "Google no devolvió un email."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": build_username_from_email(email),
                "first_name": first_name,
                "last_name": last_name,
            },
        )

        if created:
            user.set_unusable_password()

            if hasattr(user, "role") and not user.role:
                user.role = "customer"

            user.save()
        else:
            changed_fields = []

            if first_name and not user.first_name:
                user.first_name = first_name
                changed_fields.append("first_name")

            if last_name and not user.last_name:
                user.last_name = last_name
                changed_fields.append("last_name")

            if changed_fields:
                user.save(update_fields=changed_fields)

        tokens = build_tokens_for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "access": tokens["access"],
                "refresh": tokens["refresh"],
            }
        )