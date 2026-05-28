"""
Rutas de pagos Redsys TEST.
"""

from django.urls import path

from .views import (
    CreateRedsysPaymentView,
    RedsysNotificationView,
    RedsysOkView,
    RedsysKoView,
)

urlpatterns = [
    path("redsys/create/", CreateRedsysPaymentView.as_view(), name="redsys-create"),
    path(
        "redsys/notification/",
        RedsysNotificationView.as_view(),
        name="redsys-notification",
    ),
    path("redsys/ok/", RedsysOkView.as_view(), name="redsys-ok"),
    path("redsys/ko/", RedsysKoView.as_view(), name="redsys-ko"),
]