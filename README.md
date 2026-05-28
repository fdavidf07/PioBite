# PíoBite

**PíoBite** es una aplicación web full-stack desarrollada para la cafetería del **IES Pío Baroja**.

La plataforma permite a estudiantes, profesores y personal del centro realizar pedidos online, seleccionar una franja horaria de recogida, pagar mediante el entorno de pruebas de **Redsys** y consultar el estado de sus pedidos.

Además, incluye un panel privado para el personal de cafetería, desde el que los usuarios autorizados pueden gestionar productos, categorías, horarios y pedidos.

---

## Demo en producción

| Servicio                       | URL                                                        |
| ------------------------------ | ---------------------------------------------------------- |
| Frontend                       | https://pio-bite.vercel.app                                |

---

## Repositorio

```text
https://github.com/fdavidf07/PioBite
```

---

## Descripción general del proyecto

PíoBite nace como solución digital para mejorar la gestión de pedidos en una cafetería de instituto.

El objetivo principal es evitar colas, organizar mejor los pedidos, facilitar el pago y permitir que el personal de cafetería tenga una herramienta clara para gestionar el servicio diario.

La aplicación está dividida en dos áreas principales:

---

## Área de cliente

Los usuarios normales pueden:

* Registrarse con usuario, email y contraseña.
* Iniciar sesión con usuario y contraseña.
* Iniciar sesión con Google.
* Ver el catálogo de productos.
* Filtrar productos por categoría.
* Añadir productos al carrito.
* Modificar cantidades dentro del carrito.
* Seleccionar una franja horaria de recogida.
* Crear un pedido.
* Realizar un pago con Redsys en entorno de pruebas.
* Consultar sus pedidos.
* Ver el estado de preparación y pago de cada pedido.

---

## Área de personal de cafetería

Los usuarios autorizados como personal de cafetería pueden:

* Acceder a un panel privado.
* Ver todos los pedidos recibidos.
* Cambiar el estado de los pedidos.
* Crear, editar y eliminar categorías.
* Crear, editar y eliminar productos.
* Activar o desactivar productos.
* Marcar productos como populares o saludables.
* Crear, editar y eliminar franjas horarias.
* Gestionar la disponibilidad de horarios.
* Controlar el funcionamiento diario de la cafetería.

---

## Funcionalidades principales

### Autenticación

* Registro de usuarios.
* Inicio de sesión con usuario y contraseña.
* Inicio de sesión con Google OAuth.
* Autenticación mediante JWT.
* Control de acceso por roles.
* Diferenciación entre usuario cliente y personal de cafetería.
* Acceso protegido al panel privado de cafetería.

---

### Catálogo de productos

* Listado de productos disponibles.
* Organización por categorías.
* Sección de productos populares.
* Etiqueta para productos saludables.
* Control de disponibilidad de productos.
* Diseño responsive y mobile first.

---

### Carrito y pedidos

* Añadir productos al carrito.
* Aumentar o disminuir cantidades.
* Eliminar productos del carrito.
* Cálculo automático del total.
* Selección de franja horaria.
* Creación de pedidos persistentes en base de datos.
* Generación de código de pedido.

---

### Pagos con Redsys

* Integración con Redsys en entorno de pruebas.
* Simulación de pago real sin realizar cobros.
* Generación segura de parámetros de pago desde Django.
* Redirección a Redsys.
* Recepción de notificación de pago.
* Actualización automática del estado del pedido.
* Soporte para tarjetas de prueba.

---

### Mis pedidos

* Historial de pedidos del usuario.
* Visualización del código de pedido.
* Estado del pedido.
* Estado del pago.
* Total del pedido.
* Franja horaria seleccionada.

---

### Panel de cafetería

* Acceso solo para usuarios autorizados.
* Gestión completa de pedidos.
* Cambio de estado de pedidos.
* Gestión de productos.
* Gestión de categorías.
* Gestión de franjas horarias.
* Panel adaptado a móvil.

---

## Tecnologías utilizadas

### Frontend

| Tecnología        | Uso                           |
| ----------------- | ----------------------------- |
| React             | Interfaz de usuario           |
| Vite              | Entorno de desarrollo y build |
| Axios             | Peticiones HTTP al backend    |
| Lucide React      | Iconos                        |
| CSS personalizado | Diseño responsive             |
| Google OAuth      | Inicio de sesión con Google   |
| Vercel            | Despliegue del frontend       |

---

### Backend

| Tecnología            | Uso                                    |
| --------------------- | -------------------------------------- |
| Django                | Framework backend                      |
| Django REST Framework | API REST                               |
| Simple JWT            | Autenticación mediante tokens          |
| PostgreSQL            | Base de datos en producción            |
| SQLite                | Base de datos en desarrollo local      |
| Redsys                | Pasarela de pago en pruebas            |
| Gunicorn              | Servidor WSGI en producción            |
| WhiteNoise            | Gestión de archivos estáticos          |
| Railway               | Despliegue del backend y base de datos |

---

## Arquitectura del sistema

```text
PíoBite
│
├── Frontend - React / Vite
│   ├── Login y registro
│   ├── Login con Google
│   ├── Catálogo de productos
│   ├── Carrito
│   ├── Checkout
│   ├── Mis pedidos
│   └── Panel de cafetería
│
├── Backend - Django / DRF
│   ├── API de autenticación
│   ├── API de catálogo
│   ├── API de pedidos
│   ├── API de pagos
│   ├── API privada para cafetería
│   └── Panel de administración
│
└── Base de datos - PostgreSQL
    ├── Usuarios
    ├── Categorías
    ├── Productos
    ├── Franjas horarias
    ├── Pedidos
    └── Líneas de pedido
```

---

## Estructura del proyecto

```text
PioBite/
│
├── backend/
│   ├── accounts/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── permissions.py
│   │
│   ├── catalog/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── orders/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── payments/
│   │   ├── redsys.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   │
│   ├── manage.py
│   ├── requirements.txt
│   └── Procfile
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Roles de usuario

La aplicación utiliza un sistema de roles para separar los permisos de cada tipo de usuario.

| Rol                | Descripción         | Permisos                                            |
| ------------------ | ------------------- | --------------------------------------------------- |
| Cliente            | Usuario normal      | Comprar productos, pagar y ver sus pedidos          |
| Personal cafetería | Usuario autorizado  | Gestionar pedidos, productos, categorías y horarios |
| Administrador      | Superusuario Django | Acceso completo al panel de administración          |

Los usuarios de cafetería no se registran públicamente como personal.
Deben ser creados o autorizados desde el panel de administración de Django.

---

## Flujo de pedido

```text
Usuario inicia sesión
↓
Selecciona productos
↓
Añade productos al carrito
↓
Elige una franja horaria
↓
Crea el pedido
↓
Realiza el pago con Redsys TEST
↓
Redsys notifica al backend
↓
El pedido cambia a pagado
↓
El personal de cafetería prepara el pedido
↓
El cliente consulta el estado actualizado
```

---

## Flujo del personal de cafetería

```text
Usuario autorizado inicia sesión
↓
La app detecta que es personal de cafetería
↓
Se muestra el panel privado
↓
El personal ve los pedidos recibidos
↓
Puede cambiar el estado de los pedidos
↓
Puede gestionar productos, categorías y horarios
```

---

## Estados de pedido

| Estado     | Significado                            |
| ---------- | -------------------------------------- |
| Pendiente  | El pedido ha sido creado               |
| Preparando | La cafetería está preparando el pedido |
| Listo      | El pedido está listo para recoger      |
| Entregado  | El pedido ya ha sido entregado         |
| Cancelado  | El pedido ha sido cancelado            |

---

## Estados de pago

| Estado    | Significado                            |
| --------- | -------------------------------------- |
| Pendiente | El pago todavía no se ha completado    |
| Pagado    | El pago se ha realizado correctamente  |
| Fallido   | El pago ha fallado o ha sido rechazado |

---

## Redsys en modo prueba

La aplicación utiliza Redsys en entorno de pruebas.

Esto permite simular un pago real con tarjeta, pero sin realizar ningún cobro real.

Tarjeta de prueba Redsys:

```text
Número: 4548810000000003
Caducidad: 12/49
CVV: 123
```

Las credenciales de Redsys se almacenan únicamente en variables de entorno del backend y nunca deben subirse al repositorio.

---

## Variables de entorno

### Backend local

Crear un archivo:

```text
backend/.env
```

Ejemplo:

```env
DJANGO_SECRET_KEY=tu_clave_secreta_django
DEBUG=True

GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com

REDSYS_MERCHANT_CODE=tu_codigo_comercio
REDSYS_TERMINAL=tu_terminal
REDSYS_CURRENCY=978
REDSYS_TRANSACTION_TYPE=0
REDSYS_SECRET_KEY=tu_clave_redsys
REDSYS_URL=https://sis-t.redsys.es:25443/sis/realizarPago
REDSYS_SIGNATURE_VERSION=HMAC_SHA512_V2

BACKEND_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:5173

ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

### Backend en Railway

Variables configuradas en Railway:

```env
DJANGO_SECRET_KEY=tu_clave_secreta_produccion
DEBUG=False

DATABASE_URL=variable_de_postgresql_railway

GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com

REDSYS_MERCHANT_CODE=tu_codigo_comercio
REDSYS_TERMINAL=tu_terminal
REDSYS_CURRENCY=978
REDSYS_TRANSACTION_TYPE=0
REDSYS_SECRET_KEY=tu_clave_redsys
REDSYS_URL=https://sis-t.redsys.es:25443/sis/realizarPago
REDSYS_SIGNATURE_VERSION=HMAC_SHA512_V2

BACKEND_URL=https://mellow-trust-production-4648.up.railway.app
FRONTEND_URL=https://pio-bite.vercel.app

ALLOWED_HOSTS=mellow-trust-production-4648.up.railway.app
CORS_ALLOWED_ORIGINS=https://pio-bite.vercel.app,http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=https://mellow-trust-production-4648.up.railway.app,https://pio-bite.vercel.app,http://localhost:5173,http://127.0.0.1:5173
```

---

### Frontend local

Crear un archivo:

```text
frontend/.env
```

Ejemplo:

```env
VITE_GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

### Frontend en Vercel

Variables configuradas en Vercel:

```env
VITE_GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
VITE_API_BASE_URL=https://mellow-trust-production-4648.up.railway.app
```

---

## Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/fdavidf07/PioBite.git
cd PioBite
```

---

## Configuración del backend

### 2. Entrar en la carpeta del backend

```bash
cd backend
```

### 3. Crear entorno virtual

```bash
python -m venv .venv
```

### 4. Activar entorno virtual

En Windows:

```bash
.venv\Scripts\activate
```

En macOS/Linux:

```bash
source .venv/bin/activate
```

### 5. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 6. Configurar variables de entorno

Crear el archivo:

```text
backend/.env
```

Añadir las variables correspondientes.

### 7. Ejecutar migraciones

```bash
python manage.py migrate
```

### 8. Crear superusuario

```bash
python manage.py createsuperuser
```

### 9. Arrancar servidor backend

```bash
python manage.py runserver
```

Backend local:

```text
http://127.0.0.1:8000
```

Admin local:

```text
http://127.0.0.1:8000/admin/
```

---

## Configuración del frontend

### 10. Entrar en la carpeta del frontend

En otra terminal:

```bash
cd frontend
```

### 11. Instalar dependencias

```bash
npm install
```

### 12. Configurar variables de entorno

Crear el archivo:

```text
frontend/.env
```

Añadir:

```env
VITE_GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 13. Arrancar servidor frontend

```bash
npm run dev
```

Frontend local:

```text
http://localhost:5173
```

---

## Despliegue en producción

### Frontend en Vercel

Configuración recomendada:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Variables necesarias:

```env
VITE_GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
VITE_API_BASE_URL=https://mellow-trust-production-4648.up.railway.app
```

---

### Backend en Railway

Configuración recomendada:

```text
Root Directory: backend
```

Comando de arranque:

```text
python manage.py migrate && python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

El archivo `Procfile` contiene:

```text
web: python manage.py migrate && python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

Servicios en Railway:

```text
Backend Django
PostgreSQL
```

---

## Configuración de Google OAuth

En Google Cloud Console, configurar el cliente OAuth de tipo web.

Orígenes autorizados de JavaScript:

```text
http://localhost:5173
http://127.0.0.1:5173
https://pio-bite.vercel.app
```

El mismo Google Client ID debe estar configurado en:

```text
frontend/.env
Variables de entorno de Vercel
backend/.env
Variables de entorno de Railway
```

---

## Endpoints principales de la API

### Autenticación

| Método | Endpoint              | Descripción                             |
| ------ | --------------------- | --------------------------------------- |
| POST   | `/api/auth/register/` | Registrar usuario                       |
| POST   | `/api/auth/login/`    | Iniciar sesión con usuario y contraseña |
| POST   | `/api/auth/google/`   | Iniciar sesión con Google               |
| GET    | `/api/auth/me/`       | Obtener usuario autenticado             |

---

### Catálogo

| Método | Endpoint                 | Descripción                |
| ------ | ------------------------ | -------------------------- |
| GET    | `/api/categories/`       | Listar categorías          |
| GET    | `/api/products/`         | Listar productos           |
| GET    | `/api/products/popular/` | Listar productos populares |

---

### Pedidos

| Método | Endpoint                 | Descripción                     |
| ------ | ------------------------ | ------------------------------- |
| GET    | `/api/timeslots/`        | Listar franjas horarias activas |
| POST   | `/api/orders/`           | Crear pedido                    |
| GET    | `/api/orders/my-orders/` | Listar pedidos del usuario      |

---

### Pagos

| Método | Endpoint                             | Descripción                    |
| ------ | ------------------------------------ | ------------------------------ |
| POST   | `/api/payments/redsys/create/`       | Crear operación de pago Redsys |
| POST   | `/api/payments/redsys/notification/` | Recibir notificación de Redsys |

---

### Personal de cafetería

| Método       | Endpoint                         | Descripción                      |
| ------------ | -------------------------------- | -------------------------------- |
| GET          | `/api/staff/orders/`             | Listar todos los pedidos         |
| PATCH        | `/api/staff/orders/<id>/status/` | Actualizar estado de pedido      |
| GET/POST     | `/api/staff/categories/`         | Listar o crear categorías        |
| PATCH/DELETE | `/api/staff/categories/<id>/`    | Editar o eliminar categoría      |
| GET/POST     | `/api/staff/products/`           | Listar o crear productos         |
| PATCH/DELETE | `/api/staff/products/<id>/`      | Editar o eliminar producto       |
| GET/POST     | `/api/staff/timeslots/`          | Listar o crear franjas horarias  |
| PATCH/DELETE | `/api/staff/timeslots/<id>/`     | Editar o eliminar franja horaria |

---

## Seguridad

* Las claves secretas no se almacenan en el repositorio.
* Las credenciales de Redsys solo están en variables de entorno del backend.
* Los endpoints privados requieren autenticación JWT.
* El panel de cafetería está protegido por rol.
* Los usuarios normales no pueden acceder a la gestión interna.
* Los orígenes CORS y CSRF están configurados explícitamente.
* El entorno de producción usa `DEBUG=False`.

---

## Checklist de pruebas

### Cliente

* Registrar usuario nuevo.
* Iniciar sesión con usuario y contraseña.
* Iniciar sesión con Google.
* Ver productos.
* Filtrar por categoría.
* Añadir productos al carrito.
* Seleccionar horario.
* Crear pedido.
* Pagar con Redsys TEST.
* Consultar pedido en “Mis pedidos”.

---

### Personal de cafetería

* Iniciar sesión con usuario autorizado.
* Ver todos los pedidos.
* Cambiar estado de un pedido.
* Crear categoría.
* Editar categoría.
* Crear producto.
* Editar producto.
* Desactivar producto.
* Crear franja horaria.
* Editar franja horaria.
* Desactivar franja horaria.

---

### Administrador

* Entrar al panel de Django.
* Gestionar usuarios.
* Asignar rol de personal de cafetería.
* Revisar pedidos.
* Revisar productos.
* Comprobar estado de pagos.

---

## Limitaciones actuales

* Redsys está configurado en entorno de pruebas.
* Los pagos no realizan cobros reales.
* Los usuarios de cafetería deben ser creados o autorizados manualmente.
* La aplicación no incluye todavía estadísticas avanzadas.
* La subida de imágenes desde el panel de cafetería no está implementada todavía.

---

## Posibles mejoras futuras

* Pantalla de detalle del pedido.
* Notificaciones en tiempo real.
* Notificaciones por email.
* Notificaciones push.
* Panel de estadísticas diarias.
* Control de stock.
* Subida de imágenes de producto.
* Código QR para recogida de pedidos.
* Filtros avanzados en el panel de cafetería.
* Modo PWA para instalar la app en móvil.
* Mejoras de accesibilidad.

---

## Autor

Proyecto desarrollado por **fdavidf07** como aplicación full-stack para la cafetería del **IES Pío Baroja**.

---

## Licencia

Este proyecto ha sido desarrollado con fines educativos.

---

## Estado final del proyecto

```text
Frontend: React + Vite desplegado en Vercel
Backend: Django REST Framework desplegado en Railway
Base de datos: PostgreSQL en Railway
Pagos: Redsys TEST
Autenticación: JWT + Google OAuth
Roles: Cliente y personal de cafetería
Estado: Funcional y desplegado
```
