"""
Vistas del catálogo de PíoBite.

Incluye:
- endpoints públicos para que los clientes vean categorías y productos
- endpoints privados para que cafetería pueda crear, editar y borrar productos
"""

from rest_framework import generics
from rest_framework.permissions import AllowAny

from accounts.permissions import IsCafeteriaStaff
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryListView(generics.ListAPIView):
    """
    Lista pública de categorías.

    URL:
    GET /api/categories/
    """

    queryset = Category.objects.all().order_by("id")
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductListView(generics.ListAPIView):
    """
    Lista pública de productos disponibles.

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
    Lista pública de productos populares.

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


class StaffCategoryListCreateView(generics.ListCreateAPIView):
    """
    Gestión de categorías para cafetería.

    URL:
    GET  /api/staff/categories/
    POST /api/staff/categories/
    """

    queryset = Category.objects.all().order_by("id")
    serializer_class = CategorySerializer
    permission_classes = [IsCafeteriaStaff]


class StaffCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Editar o borrar una categoría desde cafetería.

    URL:
    GET    /api/staff/categories/<id>/
    PUT    /api/staff/categories/<id>/
    PATCH  /api/staff/categories/<id>/
    DELETE /api/staff/categories/<id>/
    """

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsCafeteriaStaff]


class StaffProductListCreateView(generics.ListCreateAPIView):
    """
    Gestión de productos para cafetería.

    URL:
    GET  /api/staff/products/
    POST /api/staff/products/
    """

    serializer_class = ProductSerializer
    permission_classes = [IsCafeteriaStaff]

    def get_queryset(self):
        return Product.objects.all().select_related("category").order_by(
            "category__name",
            "name",
        )


class StaffProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Editar o borrar un producto desde cafetería.

    URL:
    GET    /api/staff/products/<id>/
    PUT    /api/staff/products/<id>/
    PATCH  /api/staff/products/<id>/
    DELETE /api/staff/products/<id>/
    """

    queryset = Product.objects.all().select_related("category")
    serializer_class = ProductSerializer
    permission_classes = [IsCafeteriaStaff]