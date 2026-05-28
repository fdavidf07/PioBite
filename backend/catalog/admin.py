"""
Configuración del catálogo en el panel de administración.

Permite gestionar categorías y productos desde el admin de Django.
"""

from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    # Campos visibles en la tabla de categorías
    list_display = (
        "id",
        "name",
        "icon",
    )

    # Campo de búsqueda
    search_fields = (
        "name",
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # Campos visibles en la tabla de productos
    list_display = (
        "id",
        "name",
        "category",
        "price",
        "is_available",
        "is_healthy",
        "is_popular",
    )

    # Filtros laterales
    list_filter = (
        "category",
        "is_available",
        "is_healthy",
        "is_popular",
    )

    # Campos de búsqueda
    search_fields = (
        "name",
        "description",
    )