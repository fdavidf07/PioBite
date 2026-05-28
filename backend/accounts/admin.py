"""
Configuración del modelo User en el panel de administración.

Permite visualizar y editar usuarios, incluyendo los campos propios
de PíoBite: role y phone.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Campos visibles en la lista de usuarios
    list_display = (
        "id",
        "username",
        "email",
        "role",
        "phone",
        "is_staff",
        "is_active",
    )

    # Filtros laterales del panel admin
    list_filter = (
        "role",
        "is_staff",
        "is_active",
    )

    # Campos por los que se puede buscar
    search_fields = (
        "username",
        "email",
        "phone",
    )

    # Añadimos role y phone al formulario de edición del usuario
    fieldsets = UserAdmin.fieldsets + (
        (
            "Datos de PíoBite",
            {
                "fields": (
                    "role",
                    "phone",
                )
            },
        ),
    )

    # Añadimos role y phone también al formulario de creación de usuario
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Datos de PíoBite",
            {
                "fields": (
                    "role",
                    "phone",
                )
            },
        ),
    )