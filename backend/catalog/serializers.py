"""
Serializers del catálogo de PíoBite.

Transforman categorías y productos a JSON para que React pueda mostrarlos
en la pantalla de catálogo.
"""

from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer para categorías de productos.
    """

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "icon",
        )


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer para productos.

    Incluye datos de la categoría para que el frontend no tenga que hacer
    consultas extra.
    """

    category_name = serializers.CharField(source="category.name", read_only=True)
    category_icon = serializers.CharField(source="category.icon", read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "description",
            "price",
            "category",
            "category_name",
            "category_icon",
            "image",
            "image_url",
            "is_available",
            "is_healthy",
            "is_popular",
        )

    def get_image_url(self, obj):
        """
        Devuelve la URL completa de la imagen si el producto tiene imagen.
        """

        request = self.context.get("request")

        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)

        if obj.image:
            return obj.image.url

        return None