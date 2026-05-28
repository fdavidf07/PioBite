"""
Vistas de usuarios para PíoBite.

Incluye:
- Registro normal de usuarios
- Consulta del usuario autenticado
- Login con Google usando el token recibido desde React
"""

from django.conf import settings
from django.contrib.auth import get_user_model

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer


# Obtenemos el modelo de usuario personalizado
User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    Vista para registrar usuarios normales.

    URL:
    POST /api/auth/register/
    """

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(APIView):
    """
    Vista para obtener los datos del usuario autenticado.

    URL:
    GET /api/auth/me/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Convertimos el usuario autenticado a JSON
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class GoogleLoginView(APIView):
    """
    Vista para iniciar sesión con Google.

    React envía un credential token.
    Django lo valida con Google.
    Si el usuario no existe, se crea automáticamente.
    Después se devuelven tokens JWT propios de Django.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        # Recibimos el token de Google enviado desde React
        credential = request.data.get("credential")

        if not credential:
            return Response(
                {"detail": "No se recibió el credential de Google."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Comprobamos que el Client ID esté configurado
        if not settings.GOOGLE_CLIENT_ID:
            return Response(
                {"detail": "GOOGLE_CLIENT_ID no está configurado en el backend."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            # Verificamos el token con Google
            google_user = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError:
            return Response(
                {"detail": "Token de Google inválido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Extraemos datos básicos del usuario de Google
        email = google_user.get("email")
        first_name = google_user.get("given_name", "")
        last_name = google_user.get("family_name", "")

        if not email:
            return Response(
                {"detail": "Google no devolvió un email válido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Buscamos si ya existe un usuario con ese email
        user = User.objects.filter(email=email).first()

        if not user:
            # Si no existe, creamos un username basado en el email
            base_username = email.split("@")[0]
            username = base_username
            counter = 1

            # Evitamos usernames repetidos
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            # Creamos el usuario como cliente/alumno
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                role=User.ROLE_CLIENT,
            )
        else:
            # Si el usuario ya existe, actualizamos nombre/apellidos si estaban vacíos
            changed = False

            if first_name and not user.first_name:
                user.first_name = first_name
                changed = True

            if last_name and not user.last_name:
                user.last_name = last_name
                changed = True

            if changed:
                user.save()

        # Generamos tokens JWT para el usuario
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            }
        )