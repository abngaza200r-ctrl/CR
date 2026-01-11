import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext, useRef } from "react";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

// Pages
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthCallback from "./components/AuthCallback";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Context
export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Cart Context
export const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// App Router Component
function AppRouter() {
  const location = useLocation();

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  // Check URL fragment for session_id synchronously during render
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <div className="min-h-screen bg-[#030014] bg-grid relative">
      <div className="bg-noise"></div>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:category" element={<ServicesPage />} />
          <Route path="/product/:productId" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const hasCheckedAuth = useRef(false);

  // Check auth on mount
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch cart when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setCartLoading(true);
    try {
      const response = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add items to cart");
      return false;
    }

    try {
      await axios.post(
        `${API}/cart/add`,
        { product_id: productId, quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      await fetchCart();
      toast.success("Added to cart!");
      return true;
    } catch (error) {
      toast.error("Failed to add to cart");
      return false;
    }
  };

  const updateCartItem = async (productId, quantity) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.put(
        `${API}/cart/update`,
        { product_id: productId, quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      await fetchCart();
    } catch (error) {
      toast.error("Failed to update cart");
    }
  };

  const removeFromCart = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${API}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      await fetchCart();
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${API}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setCart([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token);
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
    setCart([]);
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      <CartContext.Provider
        value={{
          cart,
          cartLoading,
          cartTotal,
          cartCount,
          addToCart,
          updateCartItem,
          removeFromCart,
          clearCart,
          fetchCart,
        }}
      >
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(3, 0, 20, 0.9)",
              border: "1px solid rgba(0, 243, 255, 0.3)",
              color: "#fff",
            },
          }}
        />
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
