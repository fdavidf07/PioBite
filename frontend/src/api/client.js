/*
  Cliente API para PíoBite.

  Este archivo centraliza todas las peticiones HTTP al backend Django:
  - Login normal con usuario y contraseña
  - Registro con usuario, email y contraseña
  - Login con Google
  - Catálogo público
  - Pedidos de cliente
  - Redsys TEST
  - Panel privado de cafetería
*/

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const ACCESS_TOKEN_KEY = "piobite_access_token";
const REFRESH_TOKEN_KEY = "piobite_refresh_token";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const setAuthTokens = ({ access, refresh }) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const hasAccessToken = () => {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
};

export const loginWithPassword = async ({ username, password }) => {
  const response = await apiClient.post("/api/auth/login/", {
    username,
    password,
  });

  return response.data;
};

export const registerUser = async ({ username, email, password }) => {
  const response = await apiClient.post("/api/auth/register/", {
    username,
    email,
    password,
  });

  return response.data;
};

export const loginWithGoogle = async (credential) => {
  const response = await apiClient.post("/api/auth/google/", {
    credential,
  });

  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get("/api/auth/me/");
  return response.data;
};

export const getCategories = async () => {
  const response = await apiClient.get("/api/categories/");
  return response.data;
};

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

export const getPopularProducts = async () => {
  const response = await apiClient.get("/api/products/popular/");
  return response.data;
};

export const getTimeSlots = async () => {
  const response = await apiClient.get("/api/timeslots/");
  return response.data;
};

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

export const getMyOrders = async () => {
  const response = await apiClient.get("/api/orders/my-orders/");
  return response.data;
};

export const createRedsysPayment = async (orderId) => {
  const response = await apiClient.post("/api/payments/redsys/create/", {
    order_id: orderId,
  });

  return response.data;
};

export const getStaffOrders = async () => {
  const response = await apiClient.get("/api/staff/orders/");
  return response.data;
};

export const updateStaffOrderStatus = async ({ orderId, status }) => {
  const response = await apiClient.patch(`/api/staff/orders/${orderId}/status/`, {
    status,
  });

  return response.data;
};

export const getStaffCategories = async () => {
  const response = await apiClient.get("/api/staff/categories/");
  return response.data;
};

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

export const deleteStaffCategory = async (categoryId) => {
  await apiClient.delete(`/api/staff/categories/${categoryId}/`);
};

export const getStaffProducts = async () => {
  const response = await apiClient.get("/api/staff/products/");
  return response.data;
};

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

export const deleteStaffProduct = async (productId) => {
  await apiClient.delete(`/api/staff/products/${productId}/`);
};

export const getStaffTimeSlots = async () => {
  const response = await apiClient.get("/api/staff/timeslots/");
  return response.data;
};

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

export const deleteStaffTimeSlot = async (timeSlotId) => {
  await apiClient.delete(`/api/staff/timeslots/${timeSlotId}/`);
};