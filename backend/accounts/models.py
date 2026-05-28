"""
Modelo de usuario personalizado para PíoBite.

Este modelo hereda de AbstractUser y añade un campo role para diferenciar
entre alumnos/clientes y personal de cafetería.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # Rol de alumno o cliente
    ROLE_CLIENT = "client"

    # Rol de personal de cafetería
    ROLE_STAFF = "staff"

    # Opciones disponibles para el campo role
    ROLE_CHOICES = [
        (ROLE_CLIENT, "Alumno / Cliente"),
        (ROLE_STAFF, "Personal Cafetería"),
    ]

    # Campo que indica el tipo de usuario dentro de la aplicación
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_CLIENT,
    )

    # Teléfono opcional del usuario
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    def __str__(self):
        # Texto que se mostrará en el panel de administración
        return f"{self.username} - {self.get_role_display()}"