# PíoBite

**PíoBite** is a full-stack web application developed for the cafeteria of **IES Pío Baroja**.
The platform allows students, teachers and staff to order cafeteria products online, pay through a Redsys test payment gateway, and track the status of their orders in real time.

The project also includes a private staff dashboard for cafeteria workers, where authorized users can manage products, categories, pickup time slots and customer orders.

---

## Live Demo

| Service      | URL                                                        |
| ------------ | ---------------------------------------------------------- |
| Frontend     | https://pio-bite.vercel.app                                |
| Backend      | https://mellow-trust-production-4648.up.railway.app        |
| Django Admin | https://mellow-trust-production-4648.up.railway.app/admin/ |

---

## Repository

```text
https://github.com/fdavidf07/PioBite
```

---

## Project Overview

PíoBite solves a common problem in school cafeterias: long queues, unclear order status and manual order management.

The application provides two main experiences:

### Customer Area

Regular users can:

* Register with username, email and password.
* Log in with username and password.
* Log in using Google OAuth.
* Browse the product catalogue.
* Filter products by category.
* Add products to a cart.
* Select a pickup time slot.
* Create an order.
* Pay using Redsys test environment.
* View their previous orders.
* Track the status of each order.

### Cafeteria Staff Area

Authorized cafeteria users can:

* Access a private staff dashboard.
* View all customer orders.
* Change order status.
* Manage product categories.
* Create, edit and delete products.
* Mark products as available, healthy or popular.
* Create, edit and delete pickup time slots.
* Control which products and time slots are visible to customers.

---

## Main Features

### Authentication

* JWT authentication with Django REST Framework Simple JWT.
* Google OAuth login.
* Regular username/password login.
* User registration.
* Role-based access control.
* Separate customer and cafeteria staff experiences.

### Product Catalogue

* Product listing.
* Product categories.
* Popular products section.
* Product availability control.
* Healthy product label.
* Mobile-first responsive layout.

### Cart and Checkout

* Add products to cart.
* Increase/decrease quantities.
* Remove products from cart.
* Calculate total price automatically.
* Choose pickup time slot.
* Create a persistent order in the backend.

### Payments

* Redsys test gateway integration.
* Secure payment parameter generation from Django.
* Payment notification endpoint.
* Automatic payment status update.
* Test card support.
* No real money is charged.

### Customer Orders

* Customer order history.
* Order status tracking.
* Payment status tracking.
* Order code display.

### Staff Dashboard

* Staff-only access.
* Daily order management.
* Order status update.
* Product management.
* Category management.
* Pickup time slot management.

### Deployment

* Frontend deployed on Vercel.
* Backend deployed on Railway.
* PostgreSQL database hosted on Railway.
* Environment-based configuration.
* Production-ready CORS and CSRF configuration.

---

## Tech Stack

### Frontend

| Technology   | Purpose                           |
| ------------ | --------------------------------- |
| React        | User interface                    |
| Vite         | Frontend tooling and build system |
| Axios        | HTTP requests                     |
| Lucide React | Icons                             |
| CSS          | Custom responsive styling         |
| Google OAuth | Google login                      |

### Backend

| Technology            | Purpose                      |
| --------------------- | ---------------------------- |
| Django                | Backend framework            |
| Django REST Framework | REST API                     |
| Simple JWT            | Token authentication         |
| PostgreSQL            | Production database          |
| SQLite                | Local development database   |
| Redsys                | Test payment gateway         |
| WhiteNoise            | Static files in production   |
| Gunicorn              | Production WSGI server       |
| Railway               | Backend and database hosting |

### Deployment

| Platform           | Purpose                               |
| ------------------ | ------------------------------------- |
| Vercel             | Frontend hosting                      |
| Railway            | Backend hosting                       |
| Railway PostgreSQL | Production database                   |
| GitHub             | Version control and deployment source |

---

## Architecture

```text
PíoBite
│
├── Frontend - React / Vite
│   ├── Login and registration
│   ├── Google authentication
│   ├── Customer catalogue
│   ├── Cart and checkout
│   ├── Customer orders
│   └── Staff dashboard
│
├── Backend - Django / DRF
│   ├── Authentication API
│   ├── Catalogue API
│   ├── Orders API
│   ├── Payments API
│   ├── Staff management API
│   └── Admin panel
│
└── Database - PostgreSQL
    ├── Users
    ├── Products
    ├── Categories
    ├── Orders
    ├── Order items
    └── Time slots
```

---

## Folder Structure

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

## User Roles

The application uses role-based logic to separate normal users from cafeteria staff.

| Role     | Description          | Access                                    |
| -------- | -------------------- | ----------------------------------------- |
| Customer | Regular user         | Catalogue, cart, orders and payments      |
| Staff    | Cafeteria worker     | Staff dashboard and management tools      |
| Admin    | Django administrator | Django admin panel and full system access |

A cafeteria user should not be publicly registered as staff.
Staff users must be created or authorized from the Django admin panel.

---

## Order Flow

```text
Customer logs in
↓
Customer selects products
↓
Customer adds products to cart
↓
Customer chooses pickup time slot
↓
Order is created in Django
↓
Customer pays through Redsys TEST
↓
Redsys notifies the backend
↓
Payment status is updated
↓
Staff prepares the order
↓
Customer sees updated order status
```

---

## Staff Flow

```text
Staff user logs in
↓
Application detects staff role
↓
Staff dashboard is displayed
↓
Staff can view orders
↓
Staff can update order status
↓
Staff can manage products, categories and time slots
```

---

## Order Statuses

| Status    | Meaning                          |
| --------- | -------------------------------- |
| Pending   | Order has been created           |
| Preparing | Cafeteria is preparing the order |
| Ready     | Order is ready for pickup        |
| Delivered | Order has been delivered         |
| Cancelled | Order has been cancelled         |

---

## Payment Statuses

| Status  | Meaning                            |
| ------- | ---------------------------------- |
| Pending | Payment has not been completed yet |
| Paid    | Payment was completed successfully |
| Failed  | Payment failed or was rejected     |

---

## Redsys Test Payment

The project uses Redsys in test mode.
This means that the payment flow behaves like a real card payment, but no real money is charged.

Example Redsys test card:

```text
Card number: 4548810000000003
Expiry date: 12/49
CVV: 123
```

The Redsys credentials are stored only in backend environment variables and must never be committed to GitHub.

---

## Environment Variables

### Backend Environment Variables

Create a `.env` file inside the `backend/` folder for local development.

```env
DJANGO_SECRET_KEY=your_django_secret_key
DEBUG=True

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

REDSYS_MERCHANT_CODE=your_redsys_merchant_code
REDSYS_TERMINAL=your_redsys_terminal
REDSYS_CURRENCY=978
REDSYS_TRANSACTION_TYPE=0
REDSYS_SECRET_KEY=your_redsys_secret_key
REDSYS_URL=https://sis-t.redsys.es:25443/sis/realizarPago
REDSYS_SIGNATURE_VERSION=HMAC_SHA512_V2

BACKEND_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:5173

ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

For Railway production:

```env
DJANGO_SECRET_KEY=your_production_secret_key
DEBUG=False

DATABASE_URL=your_railway_postgresql_url

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

REDSYS_MERCHANT_CODE=your_redsys_merchant_code
REDSYS_TERMINAL=your_redsys_terminal
REDSYS_CURRENCY=978
REDSYS_TRANSACTION_TYPE=0
REDSYS_SECRET_KEY=your_redsys_secret_key
REDSYS_URL=https://sis-t.redsys.es:25443/sis/realizarPago
REDSYS_SIGNATURE_VERSION=HMAC_SHA512_V2

BACKEND_URL=https://mellow-trust-production-4648.up.railway.app
FRONTEND_URL=https://pio-bite.vercel.app

ALLOWED_HOSTS=mellow-trust-production-4648.up.railway.app
CORS_ALLOWED_ORIGINS=https://pio-bite.vercel.app,http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=https://mellow-trust-production-4648.up.railway.app,https://pio-bite.vercel.app,http://localhost:5173,http://127.0.0.1:5173
```

### Frontend Environment Variables

Create a `.env` file inside the `frontend/` folder.

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_API_BASE_URL=http://127.0.0.1:8000
```

For production on Vercel:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_API_BASE_URL=https://mellow-trust-production-4648.up.railway.app
```

---

## Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/fdavidf07/PioBite.git
cd PioBite
```

---

## Backend Setup

### 2. Create and activate virtual environment

```bash
cd backend
python -m venv .venv
```

On Windows:

```bash
.venv\Scripts\activate
```

On macOS/Linux:

```bash
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create:

```text
backend/.env
```

Add the backend environment variables shown above.

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Create superuser

```bash
python manage.py createsuperuser
```

### 7. Start backend server

```bash
python manage.py runserver
```

Backend will run on:

```text
http://127.0.0.1:8000
```

Django admin:

```text
http://127.0.0.1:8000/admin/
```

---

## Frontend Setup

### 8. Install frontend dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

### 9. Configure frontend environment variables

Create:

```text
frontend/.env
```

Add:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 10. Start frontend server

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

## Production Deployment

### Frontend Deployment

The frontend is deployed on Vercel.

Recommended Vercel settings:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Required Vercel environment variables:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_API_BASE_URL=https://mellow-trust-production-4648.up.railway.app
```

---

### Backend Deployment

The backend is deployed on Railway.

Recommended Railway settings:

```text
Root Directory: backend
Start Command: python manage.py migrate && python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

The `Procfile` should contain:

```text
web: python manage.py migrate && python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

Railway services:

```text
Backend Django service
PostgreSQL database service
```

---

## Google OAuth Configuration

In Google Cloud Console, configure the OAuth client.

Authorized JavaScript origins:

```text
http://localhost:5173
http://127.0.0.1:5173
https://pio-bite.vercel.app
```

The same Google Client ID must be added to:

```text
frontend/.env
Vercel environment variables
backend/.env
Railway environment variables
```

---

## Main API Endpoints

### Authentication

| Method | Endpoint              | Description                      |
| ------ | --------------------- | -------------------------------- |
| POST   | `/api/auth/register/` | Register a new user              |
| POST   | `/api/auth/login/`    | Login with username and password |
| POST   | `/api/auth/google/`   | Login with Google                |
| GET    | `/api/auth/me/`       | Get authenticated user           |

### Catalogue

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| GET    | `/api/categories/`       | List categories       |
| GET    | `/api/products/`         | List products         |
| GET    | `/api/products/popular/` | List popular products |

### Orders

| Method | Endpoint                 | Description              |
| ------ | ------------------------ | ------------------------ |
| GET    | `/api/timeslots/`        | List active time slots   |
| POST   | `/api/orders/`           | Create order             |
| GET    | `/api/orders/my-orders/` | List current user orders |

### Payments

| Method | Endpoint                             | Description                 |
| ------ | ------------------------------------ | --------------------------- |
| POST   | `/api/payments/redsys/create/`       | Create Redsys payment       |
| POST   | `/api/payments/redsys/notification/` | Redsys payment notification |

### Staff

| Method       | Endpoint                         | Description                |
| ------------ | -------------------------------- | -------------------------- |
| GET          | `/api/staff/orders/`             | List all orders            |
| PATCH        | `/api/staff/orders/<id>/status/` | Update order status        |
| GET/POST     | `/api/staff/categories/`         | List or create categories  |
| PATCH/DELETE | `/api/staff/categories/<id>/`    | Update or delete category  |
| GET/POST     | `/api/staff/products/`           | List or create products    |
| PATCH/DELETE | `/api/staff/products/<id>/`      | Update or delete product   |
| GET/POST     | `/api/staff/timeslots/`          | List or create time slots  |
| PATCH/DELETE | `/api/staff/timeslots/<id>/`     | Update or delete time slot |

---

## Security Notes

* Secret keys are never stored in the repository.
* Redsys credentials are stored only in backend environment variables.
* Staff endpoints are protected with role-based permissions.
* JWT tokens are required for private API access.
* Normal users cannot access the staff dashboard.
* Cafeteria staff users must be created or authorized by an administrator.
* Production CORS and CSRF origins are explicitly configured.

---

## Testing Checklist

### Customer

* Register a new user.
* Log in with username and password.
* Log in with Google.
* Browse categories and products.
* Add products to cart.
* Select pickup time slot.
* Create an order.
* Pay with Redsys test card.
* Check order in “My Orders”.

### Cafeteria Staff

* Log in with authorized staff user.
* View all orders.
* Update order status.
* Create category.
* Edit category.
* Create product.
* Edit product.
* Disable product.
* Create pickup time slot.
* Edit pickup time slot.
* Disable pickup time slot.

### Admin

* Log in to Django admin.
* Manage users.
* Assign staff roles.
* Review products.
* Review orders.
* Check payment status.

---

## Known Limitations

* Redsys is configured in test mode.
* Payments do not charge real money.
* Staff users must be created or authorized manually.
* Product images currently depend on URL-based image fields or existing backend data.
* Advanced analytics are not included yet.

---

## Future Improvements

* Order detail screen for customers.
* Real-time order updates.
* Email notifications.
* Push notifications.
* Daily sales summary.
* Product image upload from staff panel.
* Stock control.
* QR code order pickup.
* Advanced admin statistics.
* Improved accessibility testing.
* Progressive Web App support.

---

## Author

Developed by **fdavidf07** as a full-stack web application project for the cafeteria of **IES Pío Baroja**.

---

## License

This project is intended for educational purposes.

---

## Final Status

The application is fully deployed and functional:

```text
Frontend: React + Vite on Vercel
Backend: Django REST Framework on Railway
Database: PostgreSQL on Railway
Payments: Redsys TEST
Authentication: JWT + Google OAuth
Roles: Customer and cafeteria staff
```
