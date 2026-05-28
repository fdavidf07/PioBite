"""
Configuración principal del backend Django de PíoBite.

Este archivo activa Django REST Framework, CORS, autenticación JWT,
archivos multimedia y las aplicaciones propias del proyecto:
accounts, catalog y orders.
"""

from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv
import dj_database_url
load_dotenv()
# Ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# Clave secreta de Django.
# En producción la cambiaremos por una variable de entorno.
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "clave-desarrollo-piobite")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
# En desarrollo dejamos DEBUG en True.
# En producción debe ser False.
DEBUG = os.getenv("DEBUG", "True") == "True"

# Hosts permitidos para desarrollo local.
ALLOWED_HOSTS = os.getenv(
    "ALLOWED_HOSTS",
    "localhost,127.0.0.1",
).split(",")

# Aplicaciones instaladas
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

# Middlewares del proyecto
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

# Archivo principal de rutas
ROOT_URLCONF = "config.urls"

# Configuración de plantillas
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",

        # De momento no usamos plantillas propias porque el frontend será React
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

# Configuración WSGI
WSGI_APPLICATION = "config.wsgi.application"

# Base de datos local.
# Para empezar usamos SQLite. Más adelante en Railway usaremos PostgreSQL.
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

# Modelo de usuario personalizado
AUTH_USER_MODEL = "accounts.User"

# Validadores de contraseña
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

# Idioma y zona horaria
LANGUAGE_CODE = "es-es"
TIME_ZONE = "Europe/Madrid"
USE_I18N = True
USE_TZ = True

# Archivos estáticos
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
# Archivos multimedia.
# Aquí se guardarán imágenes de productos si más adelante las subimos desde admin.
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ID automático por defecto en modelos
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Permitimos que React en local pueda llamar al backend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Configuración de Django REST Framework
REST_FRAMEWORK = {
    # Usaremos JWT para autenticar usuarios desde React
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),

    # Por defecto las rutas estarán protegidas.
    # Luego en algunas vistas públicas cambiaremos permisos.
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

# Configuración de tokens JWT
SIMPLE_JWT = {
    # Duración del token de acceso
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=2),

    # Duración del token de refresco
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}
# Configuración Redsys TEST.
# Estos valores se cargarán desde backend/.env.
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

# URLs de la aplicación.
BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")