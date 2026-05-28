"""
Serializers de usuarios para PíoBite.

Este archivo transforma los usuarios de Django a JSON y permite registrar
nuevos usuarios desde el frontend de React.
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar los datos básicos del usuario autenticado.
    """

    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "role_display",
            "phone",
        )


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer para registrar nuevos alumnos/clientes.

    Por seguridad, los usuarios creados desde registro serán clientes.
    El personal de cafetería se puede crear desde el panel de administración.
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "phone",
        )

    def create(self, validated_data):
        """
        Crea un usuario nuevo usando create_user para guardar la contraseña cifrada.
        """

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            password=validated_data["password"],
            phone=validated_data.get("phone", ""),
            role=User.ROLE_CLIENT,
        )

        return user