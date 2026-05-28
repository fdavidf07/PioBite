"""
Serializers de usuarios para PíoBite.

Incluye:
- Serializer público del usuario autenticado
- Serializer de registro simple con usuario, email y contraseña
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.SerializerMethodField()

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
            "is_staff",
        )
        read_only_fields = fields

    def get_role_display(self, obj):
        if hasattr(obj, "get_role_display"):
            return obj.get_role_display()

        return getattr(obj, "role", "customer")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password",
        )

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe una cuenta con este email.")

        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        if hasattr(user, "role") and not user.role:
            user.role = "customer"
            user.save(update_fields=["role"])

        return user