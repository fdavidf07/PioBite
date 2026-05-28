/*
  Cliente API para PíoBite.

  Este archivo centraliza todas las peticiones HTTP al backend Django:
  - Autenticación normal y Google
  - Catálogo público
  - Pedidos de cliente
  - Redsys TEST
  - Panel privado de cafetería
*/

import axios from "axios";

// URL base del backend.
// Se lee desde frontend/.env mediante VITE_API_BASE_URL.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Claves de localStorage para guardar JWT.
const ACCESS_TOKEN_KEY = "piobite_access_token";
const REFRESH_TOKEN_KEY = "piobite_refresh_token";

// Cliente principal de Axios.
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Añadimos automáticamente el token JWT a las peticiones protegidas.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Guarda los tokens JWT.
export const setAuthTokens = ({ access, refresh }) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

// Borra los tokens JWT.
export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Comprueba si hay token de acceso.
export const hasAccessToken = () => {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
};

// Login normal con username y password.
export const loginWithPassword = async ({ username, password }) => {
  const response = await apiClient.post("/api/auth/login/", {
    username,
    password,
  });

  return response.data;
};

// Registro normal de cliente.
export const registerUser = async ({
  username,
  email,
  firstName,
  lastName,
  password,
  phone,
}) => {
  const response = await apiClient.post("/api/auth/register/", {
    username,
    email,
    first_name: firstName,
    last_name: lastName,
    password,
    phone,
  });

  return response.data;
};

// Login con Google.
export const loginWithGoogle = async (credential) => {
  const response = await apiClient.post("/api/auth/google/", {
    credential,
  });

  return response.data;
};

// Usuario autenticado.
export const getMe = async () => {
  const response = await apiClient.get("/api/auth/me/");
  return response.data;
};

// Categorías públicas.
export const getCategories = async () => {
  const response = await apiClient.get("/api/categories/");
  return response.data;
};

// Productos públicos.
export const getProducts = async ({ categoryId = null, search = "" } = {}) => {
  const params = {};

  if (categoryId) {
    params.category = categoryId;
  }

  if (search.trim() !== "") {
    params.search = search.trim();
  }

  const response = await apiClient.get("/api/products/", { params });
  return response.data;
};

// Productos populares.
export const getPopularProducts = async () => {
  const response = await apiClient.get("/api/products/popular/");
  return response.data;
};

// Franjas horarias públicas.
export const getTimeSlots = async () => {
  const response = await apiClient.get("/api/timeslots/");
  return response.data;
};

// Crear pedido.
export const createOrder = async ({ pickupDate, timeSlotId, cart }) => {
  const items = cart.map((item) => ({
    product_id: item.product.id,
    quantity: item.quantity,
  }));

  const response = await apiClient.post("/api/orders/", {
    pickup_date: pickupDate,
    time_slot_id: timeSlotId,
    items,
  });

  return response.data;
};

// Mis pedidos.
export const getMyOrders = async () => {
  const response = await apiClient.get("/api/orders/my-orders/");
  return response.data;
};

// Preparar pago Redsys.
export const createRedsysPayment = async (orderId) => {
  const response = await apiClient.post("/api/payments/redsys/create/", {
    order_id: orderId,
  });

  return response.data;
};

// =========================
// PANEL CAFETERÍA
// =========================

// Pedidos de cafetería.
export const getStaffOrders = async () => {
  const response = await apiClient.get("/api/staff/orders/");
  return response.data;
};

// Cambiar estado de pedido.
export const updateStaffOrderStatus = async ({ orderId, status }) => {
  const response = await apiClient.patch(`/api/staff/orders/${orderId}/status/`, {
    status,
  });

  return response.data;
};

// Categorías staff.
export const getStaffCategories = async () => {
  const response = await apiClient.get("/api/staff/categories/");
  return response.data;
};

// Crear o actualizar categoría.
export const saveStaffCategory = async (category) => {
  const payload = {
    name: category.name,
    icon: category.icon,
  };

  if (category.id) {
    const response = await apiClient.patch(
      `/api/staff/categories/${category.id}/`,
      payload
    );
    return response.data;
  }

  const response = await apiClient.post("/api/staff/categories/", payload);
  return response.data;
};

// Borrar categoría.
export const deleteStaffCategory = async (categoryId) => {
  await apiClient.delete(`/api/staff/categories/${categoryId}/`);
};

// Productos staff.
export const getStaffProducts = async () => {
  const response = await apiClient.get("/api/staff/products/");
  return response.data;
};

// Crear o actualizar producto.
export const saveStaffProduct = async (product) => {
  const payload = {
    name: product.name,
    description: product.description,
    price: product.price,
    category: Number(product.category),
    is_available: Boolean(product.is_available),
    is_healthy: Boolean(product.is_healthy),
    is_popular: Boolean(product.is_popular),
  };

  if (product.id) {
    const response = await apiClient.patch(
      `/api/staff/products/${product.id}/`,
      payload
    );
    return response.data;
  }

  const response = await apiClient.post("/api/staff/products/", payload);
  return response.data;
};

// Borrar producto.
export const deleteStaffProduct = async (productId) => {
  await apiClient.delete(`/api/staff/products/${productId}/`);
};

// Franjas horarias staff.
export const getStaffTimeSlots = async () => {
  const response = await apiClient.get("/api/staff/timeslots/");
  return response.data;
};

// Crear o actualizar franja.
export const saveStaffTimeSlot = async (timeSlot) => {
  const payload = {
    label: timeSlot.label,
    start_time: timeSlot.start_time,
    end_time: timeSlot.end_time,
    max_orders: Number(timeSlot.max_orders),
    is_active: Boolean(timeSlot.is_active),
  };

  if (timeSlot.id) {
    const response = await apiClient.patch(
      `/api/staff/timeslots/${timeSlot.id}/`,
      payload
    );
    return response.data;
  }

  const response = await apiClient.post("/api/staff/timeslots/", payload);
  return response.data;
};

// Borrar franja.
export const deleteStaffTimeSlot = async (timeSlotId) => {
  await apiClient.delete(`/api/staff/timeslots/${timeSlotId}/`);
};