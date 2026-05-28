"""
Vistas del catálogo de PíoBite.

Permiten consultar categorías, productos, productos populares y aplicar
filtros básicos desde React.
"""

from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryListView(generics.ListAPIView):
    """
    Lista todas las categorías.

    URL:
    GET /api/categories/
    """

    queryset = Category.objects.all().order_by("id")
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductListView(generics.ListAPIView):
    """
    Lista productos disponibles.

    Filtros opcionales:
    - ?category=1
    - ?search=cafe
    - ?healthy=true

    URL:
    GET /api/products/
    """

    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(is_available=True).select_related("category")

        category_id = self.request.query_params.get("category")
        search = self.request.query_params.get("search")
        healthy = self.request.query_params.get("healthy")

        if category_id:
            queryset = queryset.filter(category_id=category_id)

        if search:
            queryset = queryset.filter(name__icontains=search)

        if healthy == "true":
            queryset = queryset.filter(is_healthy=True)

        return queryset.order_by("category__name", "name")


class PopularProductListView(generics.ListAPIView):
    """
    Lista productos populares.

    URL:
    GET /api/products/popular/
    """

    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Product.objects.filter(
            is_available=True,
            is_popular=True,
        ).select_related("category").order_by("name")