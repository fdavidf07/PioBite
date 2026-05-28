"""
Modelos del catálogo de productos.

Aquí guardamos las categorías y los productos disponibles en la cafetería.
Cada producto pertenece a una categoría y puede tener precio, imagen,
disponibilidad, indicador saludable y destacado/popular.
"""

from django.db import models


class Category(models.Model):
    # Nombre de la categoría, por ejemplo: Bocadillos, Bebidas, Bollería
    name = models.CharField(max_length=100)

    # Icono o emoji visible en el frontend
    icon = models.CharField(
        max_length=10,
        blank=True,
        null=True,
    )

    def __str__(self):
        # Texto que se mostrará en el panel admin
        return self.name


class Product(models.Model):
    # Nombre del producto
    name = models.CharField(max_length=150)

    # Descripción opcional del producto
    description = models.TextField(
        blank=True,
        null=True,
    )

    # Precio del producto
    price = models.DecimalField(
        max_digits=6,
        decimal_places=2,
    )

    # Categoría a la que pertenece el producto
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products",
    )

    # Imagen opcional del producto
    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True,
    )

    # Indica si el producto está disponible para comprar
    is_available = models.BooleanField(default=True)

    # Indica si el producto es saludable
    is_healthy = models.BooleanField(default=False)

    # Indica si el producto aparece como popular
    is_popular = models.BooleanField(default=False)

    def __str__(self):
        # Texto que se mostrará en el panel admin
        return self.name