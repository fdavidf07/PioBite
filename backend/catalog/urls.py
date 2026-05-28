"""
Rutas del catálogo de productos.

Incluye rutas públicas para clientes y rutas privadas para cafetería.
"""

from django.urls import path

from .views import (
    CategoryListView,
    ProductListView,
    PopularProductListView,
    StaffCategoryListCreateView,
    StaffCategoryDetailView,
    StaffProductListCreateView,
    StaffProductDetailView,
)

urlpatterns = [
    # Rutas públicas
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("products/", ProductListView.as_view(), name="product-list"),
    path("products/popular/", PopularProductListView.as_view(), name="popular-products"),

    # Rutas privadas de cafetería
    path(
        "staff/categories/",
        StaffCategoryListCreateView.as_view(),
        name="staff-category-list-create",
    ),
    path(
        "staff/categories/<int:pk>/",
        StaffCategoryDetailView.as_view(),
        name="staff-category-detail",
    ),
    path(
        "staff/products/",
        StaffProductListCreateView.as_view(),
        name="staff-product-list-create",
    ),
    path(
        "staff/products/<int:pk>/",
        StaffProductDetailView.as_view(),
        name="staff-product-detail",
    ),
]