/*
  Cliente API para conectar React con Django.

  Centraliza:
  - Login con Google
  - Tokens JWT
  - Catálogo
  - Horarios
  - Pedidos
  - Pago Redsys TEST
*/

import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

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