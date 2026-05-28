"""
Rutas del catálogo de productos.
"""

from django.urls import path
from .views import CategoryListView, ProductListView, PopularProductListView

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("products/", ProductListView.as_view(), name="product-list"),
    path("products/popular/", PopularProductListView.as_view(), name="popular-products"),
]