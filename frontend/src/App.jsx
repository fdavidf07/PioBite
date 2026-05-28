/*
  Componente principal de PíoBite.

  Incluye:
  - Pantalla de inicio de sesión bien maquetada
  - Registro simple con usuario, email y contraseña
  - Login con Google
  - Zona cliente con catálogo, carrito, pagos y mis pedidos
  - Zona cafetería protegida por rol
  - Gestión de pedidos, productos, categorías y horarios
*/

import { useEffect, useMemo, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

import {
  clearAuthTokens,
  createOrder,
  createRedsysPayment,
  deleteStaffCategory,
  deleteStaffProduct,
  deleteStaffTimeSlot,
  getCategories,
  getMe,
  getMyOrders,
  getPopularProducts,
  getProducts,
  getStaffCategories,
  getStaffOrders,
  getStaffProducts,
  getStaffTimeSlots,
  getTimeSlots,
  hasAccessToken,
  loginWithGoogle,
  loginWithPassword,
  registerUser,
  saveStaffCategory,
  saveStaffProduct,
  saveStaffTimeSlot,
  setAuthTokens,
  updateStaffOrderStatus,
} from "./api/client";

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Edit,
  Home,
  LogOut,
  Minus,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShoppingCart,
  Trash2,
  User,
} from "lucide-react";

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [cartOpen, setCartOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cart, setCart] = useState([]);

  const [checkoutStep, setCheckoutStep] = useState("catalog");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [myOrders, setMyOrders] = useState([]);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);

  const isStaffUser = (user) => {
    return user?.role === "staff" || user?.is_staff === true;
  };

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        setAuthLoading(true);

        if (!hasAccessToken()) {
          setAuthUser(null);
          return;
        }

        const user = await getMe();
        setAuthUser(user);
      } catch (err) {
        console.error(err);
        clearAuthTokens();
        setAuthUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  const finishLogin = async ({ access, refresh, user = null }) => {
    setAuthTokens({ access, refresh });

    if (user) {
      setAuthUser(user);
      return;
    }

    const currentUser = await getMe();
    setAuthUser(currentUser);
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();

    try {
      setAuthError("");
      setAuthSuccess("");

      const data = await loginWithPassword(loginForm);
      await finishLogin(data);
    } catch (err) {
      console.error(err);
      setAuthError("Usuario o contraseña incorrectos.");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      setAuthError("");
      setAuthSuccess("");

      await registerUser(registerForm);

      setAuthSuccess("Cuenta creada correctamente. Ya puedes iniciar sesión.");
      setLoginForm({
        username: registerForm.username,
        password: "",
      });

      setRegisterForm({
        username: "",
        email: "",
        password: "",
      });

      setAuthMode("login");
    } catch (err) {
      console.error(err);

      const backendMessage =
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.detail ||
        "No se pudo crear la cuenta.";

      setAuthError(backendMessage);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setAuthError("");
      setAuthSuccess("");

      if (!credentialResponse.credential) {
        setAuthError("Google no devolvió credenciales.");
        return;
      }

      const data = await loginWithGoogle(credentialResponse.credential);

      await finishLogin({
        access: data.access,
        refresh: data.refresh,
        user: data.user,
      });
    } catch (err) {
      console.error(err);

      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "No se pudo iniciar sesión con Google.";

      setAuthError(backendMessage);
    }
  };

  const handleLogout = () => {
    clearAuthTokens();
    setAuthUser(null);
    setCart([]);
    setCartOpen(false);
    setCheckoutStep("catalog");
    setCreatedOrder(null);
    setSelectedTimeSlot(null);
    setPaymentError("");
    setActiveTab("home");
  };

  useEffect(() => {
    if (!authUser || isStaffUser(authUser)) {
      return;
    }

    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError("");

        const [categoriesData, productsData, popularData, timeSlotsData] =
          await Promise.all([
            getCategories(),
            getProducts(),
            getPopularProducts(),
            getTimeSlots(),
          ]);

        setCategories(categoriesData);
        setProducts(productsData);
        setPopularProducts(popularData);
        setTimeSlots(timeSlotsData);
      } catch (err) {
        console.error(err);
        setError("No se pudo conectar con el backend.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [authUser]);

  useEffect(() => {
    if (!authUser || isStaffUser(authUser)) {
      return;
    }

    const loadFilteredProducts = async () => {
      try {
        setError("");

        const productsData = await getProducts({
          categoryId: selectedCategory,
          search,
        });

        setProducts(productsData);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos.");
      }
    };

    loadFilteredProducts();
  }, [selectedCategory, search, authUser]);

  const loadMyOrders = async () => {
    try {
      setMyOrdersLoading(true);
      const orders = await getMyOrders();
      setMyOrders(orders);
    } catch (err) {
      console.error(err);
    } finally {
      setMyOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders" && authUser && !isStaffUser(authUser)) {
      loadMyOrders();
    }
  }, [activeTab, authUser]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      return total + Number(item.product.price) * item.quantity;
    }, 0);
  }, [cart]);

  const todayDate = useMemo(() => {
    return new Date().toISOString().slice(0, 10);
  }, []);

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { product, quantity: 1 }];
    });

    setCartOpen(true);
  };

  const increaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.product.id !== productId)
    );
  };

  const openCheckout = () => {
    if (cart.length === 0) {
      return;
    }

    setCartOpen(false);
    setOrderError("");
    setPaymentError("");
    setCheckoutStep("timeslot");
  };

  const handleCreateOrder = async () => {
    if (!selectedTimeSlot) {
      setOrderError("Selecciona una franja horaria para continuar.");
      return;
    }

    try {
      setOrderLoading(true);
      setOrderError("");
      setPaymentError("");

      const order = await createOrder({
        pickupDate: todayDate,
        timeSlotId: selectedTimeSlot.id,
        cart,
      });

      setCreatedOrder(order);
      setCart([]);
      setSelectedTimeSlot(null);
      setCheckoutStep("confirmation");
    } catch (err) {
      console.error(err);

      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "No se pudo crear el pedido.";

      setOrderError(backendMessage);
    } finally {
      setOrderLoading(false);
    }
  };

  const submitRedsysForm = (paymentData) => {
    if (
      !paymentData.redsys_url ||
      !paymentData.Ds_SignatureVersion ||
      !paymentData.Ds_MerchantParameters ||
      !paymentData.Ds_Signature
    ) {
      setPaymentError("Faltan datos para enviar el pago a Redsys.");
      return;
    }

    const form = document.createElement("form");

    form.method = "POST";
    form.action = paymentData.redsys_url;
    form.style.display = "none";

    const fields = {
      Ds_SignatureVersion: paymentData.Ds_SignatureVersion,
      Ds_MerchantParameters: paymentData.Ds_MerchantParameters,
      Ds_Signature: paymentData.Ds_Signature,
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");

      input.type = "hidden";
      input.name = name;
      input.value = value;

      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handlePayWithRedsys = async () => {
    if (!createdOrder) {
      setPaymentError("No hay pedido creado para pagar.");
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError("");

      const paymentData = await createRedsysPayment(createdOrder.id);

      submitRedsysForm(paymentData);
    } catch (err) {
      console.error(err);

      const backendMessage =
        err.response?.data?.detail ||
        "No se pudo preparar el pago con Redsys TEST.";

      setPaymentError(backendMessage);
    } finally {
      setPaymentLoading(false);
    }
  };

  const goBackToCatalog = () => {
    setCheckoutStep("catalog");
    setOrderError("");
    setPaymentError("");
    setSelectedTimeSlot(null);
  };

  if (authLoading) {
    return (
      <div className="app">
        <main className="phone-shell">
          <div className="loading-auth">
            <div className="auth-logo-badge">P</div>
            <h1>PíoBite</h1>
            <p>Cargando sesión...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!authUser) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        onLogin={handlePasswordLogin}
        onRegister={handleRegister}
        onGoogleSuccess={handleGoogleSuccess}
        authError={authError}
        authSuccess={authSuccess}
        clearMessages={() => {
          setAuthError("");
          setAuthSuccess("");
        }}
      />
    );
  }

  if (isStaffUser(authUser)) {
    return <StaffPanel authUser={authUser} onLogout={handleLogout} />;
  }

  if (checkoutStep === "timeslot") {
    return (
      <div className="app">
        <main className="phone-shell">
          <CheckoutTimeSlotScreen
            cart={cart}
            total={cartTotal}
            timeSlots={timeSlots}
            selectedTimeSlot={selectedTimeSlot}
            setSelectedTimeSlot={setSelectedTimeSlot}
            onBack={goBackToCatalog}
            onConfirm={handleCreateOrder}
            loading={orderLoading}
            error={orderError}
          />
        </main>
      </div>
    );
  }

  if (checkoutStep === "confirmation" && createdOrder) {
    return (
      <div className="app">
        <main className="phone-shell">
          <OrderConfirmationScreen
            order={createdOrder}
            onHome={() => {
              setCreatedOrder(null);
              setCheckoutStep("catalog");
              setPaymentError("");
              setActiveTab("orders");
            }}
            onPay={handlePayWithRedsys}
            paymentLoading={paymentLoading}
            paymentError={paymentError}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="phone-shell">
        <header className="hero">
          <div className="top-row">
            <div>
              <p className="hello">
                ¡Hola, {authUser.first_name || authUser.username}!
              </p>
              <h1>PíoBite</h1>
            </div>

            <div className="header-actions">
              <button
                className="logout-button"
                type="button"
                onClick={handleLogout}
                aria-label="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>

              <button
                className="cart-button"
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label="Abrir carrito"
              >
                <ShoppingCart size={20} />

                {cartItemsCount > 0 && (
                  <span className="cart-badge">{cartItemsCount}</span>
                )}
              </button>
            </div>
          </div>

          {activeTab === "home" && (
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          )}
        </header>

        <section className="content">
          {activeTab === "home" && (
            <CustomerCatalog
              loading={loading}
              error={error}
              categories={categories}
              products={products}
              popularProducts={popularProducts}
              timeSlots={timeSlots}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              search={search}
              onAdd={addToCart}
            />
          )}

          {activeTab === "orders" && (
            <CustomerOrders
              orders={myOrders}
              loading={myOrdersLoading}
              onRefresh={loadMyOrders}
            />
          )}

          {activeTab === "profile" && (
            <CustomerProfile authUser={authUser} onLogout={handleLogout} />
          )}
        </section>

        <BottomNav
          activeTab={activeTab}
          onTabClick={(tab) => {
            if (tab === "cart") {
              setCartOpen(true);
              return;
            }

            setActiveTab(tab);
          }}
        />

        {cartOpen && (
          <CartDrawer
            cart={cart}
            total={cartTotal}
            onClose={() => setCartOpen(false)}
            onIncrease={increaseQuantity}
            onDecrease={decreaseQuantity}
            onRemove={removeFromCart}
            onCheckout={openCheckout}
          />
        )}
      </main>
    </div>
  );
}

function AuthScreen({
  authMode,
  setAuthMode,
  loginForm,
  setLoginForm,
  registerForm,
  setRegisterForm,
  onLogin,
  onRegister,
  onGoogleSuccess,
  authError,
  authSuccess,
  clearMessages,
}) {
  return (
    <div className="app">
      <main className="phone-shell auth-phone-shell">
        <section className="auth-panel">
          <div className="auth-header">
            <div className="auth-logo-badge">P</div>

            <h1>PíoBite</h1>
            <h2>Cafetería Instituto Pío Baroja</h2>

            <p>
              Haz tus pedidos, consulta su estado y paga de forma segura con
              Redsys TEST.
            </p>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={authMode === "login" ? "active" : ""}
              onClick={() => {
                setAuthMode("login");
                clearMessages();
              }}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className={authMode === "register" ? "active" : ""}
              onClick={() => {
                setAuthMode("register");
                clearMessages();
              }}
            >
              Registrarse
            </button>
          </div>

          {authMode === "login" ? (
            <form className="auth-form" onSubmit={onLogin}>
              <label>
                Usuario
                <input
                  type="text"
                  placeholder="Tu usuario"
                  value={loginForm.username}
                  onChange={(event) =>
                    setLoginForm({
                      ...loginForm,
                      username: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  placeholder="Tu contraseña"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm({
                      ...loginForm,
                      password: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <button type="submit" className="auth-primary-button">
                Entrar
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={onRegister}>
              <label>
                Usuario
                <input
                  type="text"
                  placeholder="Elige un usuario"
                  value={registerForm.username}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      username: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  placeholder="tuemail@ejemplo.com"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      email: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  placeholder="Crea una contraseña"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      password: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <button type="submit" className="auth-primary-button">
                Crear cuenta
              </button>
            </form>
          )}

          {authError && <div className="auth-message error">{authError}</div>}
          {authSuccess && (
            <div className="auth-message success">{authSuccess}</div>
          )}

          <div className="auth-divider">
            <span>o continúa con</span>
          </div>

          <div className="google-login-box">
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={() => {}}
              useOneTap={false}
              width="100%"
            />
          </div>

          <p className="auth-staff-note">
            El personal de cafetería debe usar una cuenta autorizada por el
            administrador.
          </p>
        </section>
      </main>
    </div>
  );
}

function CustomerCatalog({
  loading,
  error,
  categories,
  products,
  popularProducts,
  timeSlots,
  selectedCategory,
  setSelectedCategory,
  search,
  onAdd,
}) {
  return (
    <>
      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="loading-card">Cargando productos...</div>
      ) : (
        <>
          <section className="categories-section">
            <div className="section-title-row">
              <h2>Categorías</h2>
            </div>

            <div className="category-list">
              <button
                className={
                  selectedCategory === null
                    ? "category-chip active"
                    : "category-chip"
                }
                type="button"
                onClick={() => setSelectedCategory(null)}
              >
                🍽 Todos
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  className={
                    selectedCategory === category.id
                      ? "category-chip active"
                      : "category-chip"
                  }
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span>{category.icon || "•"}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </section>

          {popularProducts.length > 0 && selectedCategory === null && !search && (
            <section className="products-section">
              <div className="section-title-row">
                <h2>⭐ Populares</h2>
              </div>

              <div className="horizontal-products">
                {popularProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={onAdd}
                    compact
                  />
                ))}
              </div>
            </section>
          )}

          <section className="products-section">
            <div className="section-title-row">
              <h2>Productos</h2>
              <span>{products.length}</span>
            </div>

            {products.length === 0 ? (
              <div className="empty-card">
                No hay productos que coincidan con la búsqueda.
              </div>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={onAdd}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="timeslot-preview">
            <div className="section-title-row">
              <h2>
                <Clock size={18} /> Horarios
              </h2>
            </div>

            <div className="timeslot-list">
              {timeSlots.slice(0, 4).map((slot) => (
                <div
                  key={slot.id}
                  className={slot.is_full ? "timeslot full" : "timeslot"}
                >
                  <span>{slot.label}</span>
                  <small>{slot.is_full ? "Completo" : "Disponible"}</small>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}

function ProductCard({ product, onAdd, compact = false }) {
  const price = Number(product.price).toFixed(2);

  return (
    <article className={compact ? "product-card compact" : "product-card"}>
      <div className="product-image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <span>{product.category_icon || "🍽"}</span>
        )}

        {product.is_healthy && <span className="healthy-tag">Saludable</span>}
      </div>

      <div className="product-info">
        <p className="product-category">{product.category_name}</p>
        <h3>{product.name}</h3>

        {product.description && (
          <p className="product-description">{product.description}</p>
        )}

        <div className="product-footer">
          <strong>{price}€</strong>

          <button
            className="add-button"
            type="button"
            onClick={() => onAdd(product)}
            aria-label={`Añadir ${product.name}`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

function CustomerOrders({ orders, loading, onRefresh }) {
  return (
    <section className="simple-screen">
      <div className="section-title-row">
        <h2>Mis pedidos</h2>

        <button type="button" className="mini-action-button" onClick={onRefresh}>
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? (
        <div className="loading-card">Cargando pedidos...</div>
      ) : orders.length === 0 ? (
        <div className="empty-card">Todavía no tienes pedidos.</div>
      ) : (
        <div className="staff-list">
          {orders.map((order) => (
            <article key={order.id} className="staff-card">
              <div className="staff-card-top">
                <div>
                  <strong>{order.code}</strong>
                  <span>{order.time_slot?.label}</span>
                </div>

                <span className="status-pill">{order.status_display}</span>
              </div>

              <p>
                Pago:{" "}
                <strong>
                  {order.payment_status_display || order.payment_status}
                </strong>
              </p>

              <p>Total: {Number(order.total_price).toFixed(2)}€</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function CustomerProfile({ authUser, onLogout }) {
  return (
    <section className="simple-screen">
      <div className="profile-card">
        <div className="profile-avatar">
          {authUser.first_name?.[0] || authUser.username?.[0] || "U"}
        </div>

        <h2>{authUser.first_name || authUser.username}</h2>
        <p>{authUser.email}</p>
        <span>{authUser.role_display || authUser.role}</span>

        <button type="button" className="confirm-order-button" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </section>
  );
}

function CartDrawer({
  cart,
  total,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
}) {
  return (
    <div className="cart-overlay">
      <div className="cart-drawer">
        <div className="drawer-handle" />

        <div className="cart-header">
          <div>
            <p>Tu pedido</p>
            <h2>Carrito</h2>
          </div>

          <button type="button" onClick={onClose} className="close-button">
            Cerrar
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCart size={34} />
            <h3>Tu carrito está vacío</h3>
            <p>Añade productos desde el catálogo para empezar tu pedido.</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.product.id} className="cart-item">
                  <div className="cart-item-icon">
                    {item.product.category_icon || "🍽"}
                  </div>

                  <div className="cart-item-info">
                    <h3>{item.product.name}</h3>
                    <p>{Number(item.product.price).toFixed(2)}€</p>

                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={() => onDecrease(item.product.id)}
                      >
                        <Minus size={14} />
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() => onIncrease(item.product.id)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => onRemove(item.product.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <div>
                <span>Total</span>
                <strong>{total.toFixed(2)}€</strong>
              </div>

              <button
                type="button"
                className="checkout-button"
                onClick={onCheckout}
              >
                Elegir horario
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CheckoutTimeSlotScreen({
  cart,
  total,
  timeSlots,
  selectedTimeSlot,
  setSelectedTimeSlot,
  onBack,
  onConfirm,
  loading,
  error,
}) {
  return (
    <>
      <header className="checkout-header">
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft size={19} />
        </button>

        <div>
          <p>Finalizar pedido</p>
          <h1>Elige tu horario</h1>
        </div>
      </header>

      <section className="content checkout-content">
        <div className="checkout-card">
          <h2>Resumen</h2>

          <div className="checkout-items">
            {cart.map((item) => (
              <div key={item.product.id} className="checkout-item">
                <span>
                  {item.quantity}x {item.product.name}
                </span>
                <strong>
                  {(Number(item.product.price) * item.quantity).toFixed(2)}€
                </strong>
              </div>
            ))}
          </div>

          <div className="checkout-total-line">
            <span>Total</span>
            <strong>{total.toFixed(2)}€</strong>
          </div>
        </div>

        <div className="checkout-card">
          <h2>Franjas disponibles</h2>

          <div className="checkout-timeslots">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                disabled={slot.is_full}
                className={
                  selectedTimeSlot?.id === slot.id
                    ? "checkout-slot selected"
                    : "checkout-slot"
                }
                onClick={() => setSelectedTimeSlot(slot)}
              >
                <Clock size={18} />
                <span>{slot.label}</span>
                <small>{slot.is_full ? "Completo" : "Disponible"}</small>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <button
          type="button"
          className="confirm-order-button"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Creando pedido..." : "Confirmar pedido"}
        </button>
      </section>
    </>
  );
}

function OrderConfirmationScreen({
  order,
  onHome,
  onPay,
  paymentLoading,
  paymentError,
}) {
  return (
    <section className="confirmation-screen">
      <div className="confirmation-icon">
        <CheckCircle2 size={40} />
      </div>

      <h1>¡Pedido creado!</h1>
      <p>
        Tu pedido ya está registrado. Ahora realiza el pago en Redsys TEST para
        confirmarlo.
      </p>

      <div className="order-code-card">
        <span>Código de pedido</span>
        <strong>{order.code}</strong>
      </div>

      <div className="confirmation-card">
        <div>
          <span>Estado pedido</span>
          <strong>{order.status_display}</strong>
        </div>

        <div>
          <span>Estado pago</span>
          <strong>{order.payment_status_display || "Pendiente de pago"}</strong>
        </div>

        <div>
          <span>Recogida</span>
          <strong>{order.time_slot?.label}</strong>
        </div>

        <div>
          <span>Total</span>
          <strong>{Number(order.total_price).toFixed(2)}€</strong>
        </div>
      </div>

      {paymentError && <div className="error-box">{paymentError}</div>}

      <button
        type="button"
        className="confirm-order-button"
        onClick={onPay}
        disabled={paymentLoading}
      >
        {paymentLoading ? "Preparando Redsys..." : "Pagar con Redsys TEST"}
      </button>

      <button
        type="button"
        className="secondary-order-button"
        onClick={onHome}
      >
        Volver a mis pedidos
      </button>
    </section>
  );
}

function StaffPanel({ authUser, onLogout }) {
  const [staffTab, setStaffTab] = useState("orders");
  const [loading, setLoading] = useState(false);
  const [staffError, setStaffError] = useState("");

  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  const emptyCategory = { id: null, name: "", icon: "" };

  const emptyProduct = {
    id: null,
    name: "",
    description: "",
    price: "",
    category: "",
    is_available: true,
    is_healthy: false,
    is_popular: false,
  };

  const emptyTimeSlot = {
    id: null,
    label: "",
    start_time: "",
    end_time: "",
    max_orders: 10,
    is_active: true,
  };

  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [timeSlotForm, setTimeSlotForm] = useState(emptyTimeSlot);

  const loadStaffData = async () => {
    try {
      setLoading(true);
      setStaffError("");

      const [ordersData, categoriesData, productsData, timeSlotsData] =
        await Promise.all([
          getStaffOrders(),
          getStaffCategories(),
          getStaffProducts(),
          getStaffTimeSlots(),
        ]);

      setOrders(ordersData);
      setCategories(categoriesData);
      setProducts(productsData);
      setTimeSlots(timeSlotsData);
    } catch (err) {
      console.error(err);
      setStaffError("No se pudieron cargar los datos del panel cafetería.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateStaffOrderStatus({ orderId, status });
      await loadStaffData();
    } catch (err) {
      console.error(err);
      setStaffError("No se pudo actualizar el estado del pedido.");
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();

    try {
      await saveStaffCategory(categoryForm);
      setCategoryForm(emptyCategory);
      await loadStaffData();
    } catch (err) {
      console.error(err);
      setStaffError("No se pudo guardar la categoría.");
    }
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();

    try {
      await saveStaffProduct(productForm);
      setProductForm(emptyProduct);
      await loadStaffData();
    } catch (err) {
      console.error(err);
      setStaffError("No se pudo guardar el producto.");
    }
  };

  const handleTimeSlotSubmit = async (event) => {
    event.preventDefault();

    try {
      await saveStaffTimeSlot(timeSlotForm);
      setTimeSlotForm(emptyTimeSlot);
      await loadStaffData();
    } catch (err) {
      console.error(err);
      setStaffError("No se pudo guardar la franja horaria.");
    }
  };

  return (
    <div className="app">
      <main className="phone-shell staff-shell">
        <header className="staff-hero">
          <div>
            <p>Panel cafetería</p>
            <h1>PíoBite</h1>
            <span>{authUser.email || authUser.username}</span>
          </div>

          <button type="button" className="logout-button" onClick={onLogout}>
            <LogOut size={18} />
          </button>
        </header>

        <nav className="staff-tabs">
          <button
            className={staffTab === "orders" ? "active" : ""}
            type="button"
            onClick={() => setStaffTab("orders")}
          >
            <ClipboardList size={17} />
            Pedidos
          </button>

          <button
            className={staffTab === "products" ? "active" : ""}
            type="button"
            onClick={() => setStaffTab("products")}
          >
            <Package size={17} />
            Productos
          </button>

          <button
            className={staffTab === "timeslots" ? "active" : ""}
            type="button"
            onClick={() => setStaffTab("timeslots")}
          >
            <Calendar size={17} />
            Horarios
          </button>
        </nav>

        <section className="content staff-content">
          {staffError && <div className="error-box">{staffError}</div>}

          {loading ? (
            <div className="loading-card">Cargando panel...</div>
          ) : (
            <>
              {staffTab === "orders" && (
                <StaffOrdersPanel
                  orders={orders}
                  onStatusChange={handleStatusChange}
                  onRefresh={loadStaffData}
                />
              )}

              {staffTab === "products" && (
                <StaffProductsPanel
                  categories={categories}
                  products={products}
                  productForm={productForm}
                  setProductForm={setProductForm}
                  categoryForm={categoryForm}
                  setCategoryForm={setCategoryForm}
                  onProductSubmit={handleProductSubmit}
                  onCategorySubmit={handleCategorySubmit}
                  onEditProduct={setProductForm}
                  onEditCategory={setCategoryForm}
                  onDeleteProduct={async (id) => {
                    await deleteStaffProduct(id);
                    await loadStaffData();
                  }}
                  onDeleteCategory={async (id) => {
                    await deleteStaffCategory(id);
                    await loadStaffData();
                  }}
                  emptyProduct={emptyProduct}
                  emptyCategory={emptyCategory}
                />
              )}

              {staffTab === "timeslots" && (
                <StaffTimeSlotsPanel
                  timeSlots={timeSlots}
                  timeSlotForm={timeSlotForm}
                  setTimeSlotForm={setTimeSlotForm}
                  onSubmit={handleTimeSlotSubmit}
                  onEdit={setTimeSlotForm}
                  onDelete={async (id) => {
                    await deleteStaffTimeSlot(id);
                    await loadStaffData();
                  }}
                  emptyTimeSlot={emptyTimeSlot}
                />
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function StaffOrdersPanel({ orders, onStatusChange, onRefresh }) {
  const statuses = [
    { value: "pending", label: "Pendiente" },
    { value: "preparing", label: "Preparando" },
    { value: "ready", label: "Listo" },
    { value: "delivered", label: "Entregado" },
    { value: "cancelled", label: "Cancelado" },
  ];

  return (
    <section>
      <div className="section-title-row">
        <h2>Pedidos</h2>

        <button type="button" className="mini-action-button" onClick={onRefresh}>
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="staff-list">
        {orders.map((order) => (
          <article key={order.id} className="staff-card">
            <div className="staff-card-top">
              <div>
                <strong>{order.code}</strong>
                <span>{order.username}</span>
              </div>

              <span className="status-pill">{order.status_display}</span>
            </div>

            <p>
              Recogida: <strong>{order.time_slot?.label}</strong>
            </p>

            <p>
              Pago:{" "}
              <strong>{order.payment_status_display || order.payment_status}</strong>
            </p>

            <p>Total: {Number(order.total_price).toFixed(2)}€</p>

            <div className="staff-status-grid">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  className={order.status === status.value ? "active" : ""}
                  onClick={() => onStatusChange(order.id, status.value)}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function StaffProductsPanel({
  categories,
  products,
  productForm,
  setProductForm,
  categoryForm,
  setCategoryForm,
  onProductSubmit,
  onCategorySubmit,
  onEditProduct,
  onEditCategory,
  onDeleteProduct,
  onDeleteCategory,
  emptyProduct,
  emptyCategory,
}) {
  return (
    <section>
      <div className="section-title-row">
        <h2>Categorías</h2>
      </div>

      <form className="staff-form" onSubmit={onCategorySubmit}>
        <input
          type="text"
          placeholder="Nombre categoría"
          value={categoryForm.name}
          onChange={(event) =>
            setCategoryForm({ ...categoryForm, name: event.target.value })
          }
          required
        />

        <input
          type="text"
          placeholder="Icono"
          value={categoryForm.icon || ""}
          onChange={(event) =>
            setCategoryForm({ ...categoryForm, icon: event.target.value })
          }
        />

        <button type="submit">
          <Save size={16} />
          {categoryForm.id ? "Actualizar categoría" : "Crear categoría"}
        </button>

        {categoryForm.id && (
          <button
            type="button"
            className="secondary-form-button"
            onClick={() => setCategoryForm(emptyCategory)}
          >
            Cancelar edición
          </button>
        )}
      </form>

      <div className="staff-list compact-list">
        {categories.map((category) => (
          <article key={category.id} className="staff-mini-card">
            <span>
              {category.icon} {category.name}
            </span>

            <div>
              <button type="button" onClick={() => onEditCategory(category)}>
                <Edit size={15} />
              </button>

              <button type="button" onClick={() => onDeleteCategory(category.id)}>
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="section-title-row">
        <h2>Productos</h2>
      </div>

      <form className="staff-form" onSubmit={onProductSubmit}>
        <input
          type="text"
          placeholder="Nombre producto"
          value={productForm.name}
          onChange={(event) =>
            setProductForm({ ...productForm, name: event.target.value })
          }
          required
        />

        <textarea
          placeholder="Descripción"
          value={productForm.description || ""}
          onChange={(event) =>
            setProductForm({ ...productForm, description: event.target.value })
          }
        />

        <input
          type="number"
          step="0.01"
          placeholder="Precio"
          value={productForm.price}
          onChange={(event) =>
            setProductForm({ ...productForm, price: event.target.value })
          }
          required
        />

        <select
          value={productForm.category}
          onChange={(event) =>
            setProductForm({ ...productForm, category: event.target.value })
          }
          required
        >
          <option value="">Selecciona categoría</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>

        <label>
          <input
            type="checkbox"
            checked={productForm.is_available}
            onChange={(event) =>
              setProductForm({
                ...productForm,
                is_available: event.target.checked,
              })
            }
          />
          Disponible
        </label>

        <label>
          <input
            type="checkbox"
            checked={productForm.is_healthy}
            onChange={(event) =>
              setProductForm({
                ...productForm,
                is_healthy: event.target.checked,
              })
            }
          />
          Saludable
        </label>

        <label>
          <input
            type="checkbox"
            checked={productForm.is_popular}
            onChange={(event) =>
              setProductForm({
                ...productForm,
                is_popular: event.target.checked,
              })
            }
          />
          Popular
        </label>

        <button type="submit">
          <Save size={16} />
          {productForm.id ? "Actualizar producto" : "Crear producto"}
        </button>

        {productForm.id && (
          <button
            type="button"
            className="secondary-form-button"
            onClick={() => setProductForm(emptyProduct)}
          >
            Cancelar edición
          </button>
        )}
      </form>

      <div className="staff-list">
        {products.map((product) => (
          <article key={product.id} className="staff-card">
            <div className="staff-card-top">
              <div>
                <strong>{product.name}</strong>
                <span>{product.category_name}</span>
              </div>

              <span className="status-pill">
                {product.is_available ? "Disponible" : "Oculto"}
              </span>
            </div>

            <p>{Number(product.price).toFixed(2)}€</p>

            <div className="staff-actions">
              <button type="button" onClick={() => onEditProduct(product)}>
                <Edit size={16} />
                Editar
              </button>

              <button type="button" onClick={() => onDeleteProduct(product.id)}>
                <Trash2 size={16} />
                Borrar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function StaffTimeSlotsPanel({
  timeSlots,
  timeSlotForm,
  setTimeSlotForm,
  onSubmit,
  onEdit,
  onDelete,
  emptyTimeSlot,
}) {
  return (
    <section>
      <div className="section-title-row">
        <h2>Franjas horarias</h2>
      </div>

      <form className="staff-form" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Etiqueta, ej: 11:00 - 11:30"
          value={timeSlotForm.label}
          onChange={(event) =>
            setTimeSlotForm({ ...timeSlotForm, label: event.target.value })
          }
          required
        />

        <input
          type="time"
          value={timeSlotForm.start_time}
          onChange={(event) =>
            setTimeSlotForm({
              ...timeSlotForm,
              start_time: event.target.value,
            })
          }
          required
        />

        <input
          type="time"
          value={timeSlotForm.end_time}
          onChange={(event) =>
            setTimeSlotForm({
              ...timeSlotForm,
              end_time: event.target.value,
            })
          }
          required
        />

        <input
          type="number"
          placeholder="Máx. pedidos"
          value={timeSlotForm.max_orders}
          onChange={(event) =>
            setTimeSlotForm({
              ...timeSlotForm,
              max_orders: event.target.value,
            })
          }
          required
        />

        <label>
          <input
            type="checkbox"
            checked={timeSlotForm.is_active}
            onChange={(event) =>
              setTimeSlotForm({
                ...timeSlotForm,
                is_active: event.target.checked,
              })
            }
          />
          Activa
        </label>

        <button type="submit">
          <Save size={16} />
          {timeSlotForm.id ? "Actualizar franja" : "Crear franja"}
        </button>

        {timeSlotForm.id && (
          <button
            type="button"
            className="secondary-form-button"
            onClick={() => setTimeSlotForm(emptyTimeSlot)}
          >
            Cancelar edición
          </button>
        )}
      </form>

      <div className="staff-list">
        {timeSlots.map((slot) => (
          <article key={slot.id} className="staff-card">
            <div className="staff-card-top">
              <div>
                <strong>{slot.label}</strong>
                <span>
                  {slot.start_time} - {slot.end_time}
                </span>
              </div>

              <span className="status-pill">
                {slot.is_active ? "Activa" : "Inactiva"}
              </span>
            </div>

            <p>Máximo pedidos: {slot.max_orders}</p>

            <div className="staff-actions">
              <button type="button" onClick={() => onEdit(slot)}>
                <Edit size={16} />
                Editar
              </button>

              <button type="button" onClick={() => onDelete(slot.id)}>
                <Trash2 size={16} />
                Borrar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BottomNav({ activeTab, onTabClick }) {
  const items = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "cart", label: "Carrito", icon: ShoppingCart },
    { id: "orders", label: "Pedidos", icon: ClipboardList },
    { id: "profile", label: "Perfil", icon: User },
  ];

  return (
    <nav className="bottom-nav four-items">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            className={activeTab === item.id ? "nav-item active" : "nav-item"}
            onClick={() => onTabClick(item.id)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default App;