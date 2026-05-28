"""
Configuración principal de Django para PíoBite.

Este archivo está preparado para funcionar tanto en local como en Railway:
- En local usa SQLite si no hay DATABASE_URL.
- En Railway usa PostgreSQL mediante DATABASE_URL.
- Lee variables desde .env o desde Railway Variables.
- Permite configurar Google Login, Redsys TEST, CORS, CSRF y archivos estáticos.
"""

from pathlib import Path
from datetime import timedelta
import os

import dj_database_url
from dotenv import load_dotenv


# Carga variables desde backend/.env en local
load_dotenv()


BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "clave-desarrollo-piobite")

DEBUG = os.getenv("DEBUG", "True") == "True"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        "ALLOWED_HOSTS",
        "localhost,127.0.0.1",
    ).split(",")
    if host.strip()
]


# APPS

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "corsheaders",

    "accounts",
    "catalog",
    "orders",
    "payments",
]


# MIDDLEWARE

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "config.urls"


# TEMPLATES

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


WSGI_APPLICATION = "config.wsgi.application"


# DATABASE
# En Railway usa DATABASE_URL.
# En local usa SQLite si DATABASE_URL no existe.

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# CUSTOM USER

AUTH_USER_MODEL = "accounts.User"


# PASSWORD VALIDATION

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# LANGUAGE / TIMEZONE

LANGUAGE_CODE = "es-es"

TIME_ZONE = "Europe/Madrid"

USE_I18N = True

USE_TZ = True


# STATIC FILES

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}


# MEDIA FILES

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# DEFAULT PRIMARY KEY

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# DJANGO REST FRAMEWORK / JWT

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
}


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=8),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# CORS / CSRF

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CSRF_TRUSTED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

CORS_ALLOW_CREDENTIALS = True


# RAILWAY / HTTPS

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True


# GOOGLE LOGIN

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")


# REDSYS TEST

REDSYS_MERCHANT_CODE = os.getenv("REDSYS_MERCHANT_CODE", "")
REDSYS_TERMINAL = os.getenv("REDSYS_TERMINAL", "1")
REDSYS_CURRENCY = os.getenv("REDSYS_CURRENCY", "978")
REDSYS_TRANSACTION_TYPE = os.getenv("REDSYS_TRANSACTION_TYPE", "0")
REDSYS_SECRET_KEY = os.getenv("REDSYS_SECRET_KEY", "")
REDSYS_URL = os.getenv(
    "REDSYS_URL",
    "https://sis-t.redsys.es:25443/sis/realizarPago",
)
REDSYS_SIGNATURE_VERSION = os.getenv(
    "REDSYS_SIGNATURE_VERSION",
    "HMAC_SHA512_V2",
)


# APP URLS

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")