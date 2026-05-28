"""
Permisos personalizados de PíoBite.

Aquí definimos quién puede acceder a las zonas privadas de cafetería.
Un usuario podrá entrar al panel de cafetería si:
- es staff de Django, o
- tiene role = "staff" en nuestro modelo User.
"""

from rest_framework.permissions import BasePermission


class IsCafeteriaStaff(BasePermission):
    """
    Permiso para usuarios autorizados de cafetería.

    Se usará en endpoints privados como:
    - gestión de productos
    - gestión de horarios
    - gestión de pedidos
    """

    message = "No tienes permiso para acceder al panel de cafetería."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        return user.is_staff or getattr(user, "role", None) == "staff"