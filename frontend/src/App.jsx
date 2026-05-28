/*
  Componente principal de PíoBite.

  Este archivo controla toda la app principal:
  - Login con Google
  - Catálogo de productos desde Django
  - Carrito
  - Selección de horario
  - Creación de pedido real
  - Pantalla de confirmación
  - Redirección a Redsys TEST para simular un pago real sin cobro
*/

import { useEffect, useMemo, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import {
  clearAuthTokens,
  createOrder,
  createRedsysPayment,
  getCategories,
  getMe,
  getPopularProducts,
  getProducts,
  getTimeSlots,
  hasAccessToken,
  loginWithGoogle,
  setAuthTokens,
} from "./api/client";

import {
  Search,
  ShoppingCart,
  Home,
  Heart,
  ClipboardList,
  User,
  Plus,
  Minus,
  Trash2,
  Clock,
  LogOut,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setAuthError("");

      if (!credentialResponse.credential) {
        setAuthError("Google no devolvió credenciales.");
        return;
      }

      const data = await loginWithGoogle(credentialResponse.credential);

      setAuthTokens({
        access: data.access,
        refresh: data.refresh,
      });

      setAuthUser(data.user);
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
  };

  useEffect(() => {
    if (!authUser) {
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
        setError(
          "No se pudo conectar con el backend. Revisa que Django esté encendido en el puerto 8000."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
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
    console.log("Datos Redsys recibidos:", paymentData);

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
          <div className="auth-screen">
            <div className="auth-logo">P</div>
            <h1>PíoBite</h1>
            <p>Cargando sesión...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="app">
        <main className="phone-shell">
          <div className="auth-screen">
            <div className="auth-logo">P</div>
            <h1>PíoBite</h1>
            <h2>Cafetería Instituto Pío Baroja</h2>
            <p>Inicia sesión con Google para realizar pedidos en la cafetería.</p>

            <div className="google-login-box">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setAuthError("Google canceló o rechazó el inicio de sesión.");
                }}
                useOneTap={false}
              />
            </div>

            {authError && <div className="auth-error">{authError}</div>}
          </div>
        </main>
      </div>
    );
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

          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </header>

        <section className="content">
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

              {popularProducts.length > 0 &&
                selectedCategory === null &&
                !search && (
                  <section className="products-section">
                    <div className="section-title-row">
                      <h2>⭐ Populares</h2>
                    </div>

                    <div className="horizontal-products">
                      {popularProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAdd={addToCart}
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
                        onAdd={addToCart}
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
        </section>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

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
        Volver al inicio
      </button>
    </section>
  );
}

function BottomNav({ activeTab, setActiveTab }) {
  const items = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "favorites", label: "Favoritos", icon: Heart },
    { id: "cart", label: "Carrito", icon: ShoppingCart },
    { id: "orders", label: "Pedidos", icon: ClipboardList },
    { id: "profile", label: "Perfil", icon: User },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            className={activeTab === item.id ? "nav-item active" : "nav-item"}
            onClick={() => setActiveTab(item.id)}
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