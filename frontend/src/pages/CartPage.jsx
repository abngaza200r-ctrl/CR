import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart, useAuth } from "../App";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "../components/ui/button";
import axios from "axios";
import { API } from "../App";
import { useState } from "react";
import { toast } from "sonner";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, updateCartItem, removeFromCart, cartLoading } = useCart();
  const { user } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setCheckoutLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API}/checkout/create-session`,
        { origin_url: window.location.origin },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      // Redirect to Stripe checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="font-orbitron text-2xl font-bold text-white mb-4">
            Please Login
          </h2>
          <p className="text-white/50 mb-6">You need to login to view your cart</p>
          <Button
            onClick={() => navigate("/login")}
            className="gradient-btn rounded-full px-8 text-black font-bold"
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-4">
            YOUR <span className="gradient-text">CART</span>
          </h1>
          <p className="text-white/50">
            {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
          </p>
        </motion.div>

        {cartLoading ? (
          <div className="flex justify-center py-20">
            <div className="spinner w-12 h-12"></div>
          </div>
        ) : cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ShoppingCart className="w-20 h-20 text-white/10 mx-auto mb-6" />
            <h2 className="font-orbitron text-2xl font-bold text-white mb-4">
              Your cart is empty
            </h2>
            <p className="text-white/50 mb-8">
              Browse our services and add items to your cart
            </p>
            <Button
              onClick={() => navigate("/services")}
              className="gradient-btn rounded-full px-8 text-black font-bold"
              data-testid="browse-services"
            >
              Browse Services
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <motion.div
                  key={item.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-4 sm:p-6"
                  data-testid={`cart-item-${item.product_id}`}
                >
                  <div className="flex gap-4 sm:gap-6">
                    {/* Image */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-orbitron font-bold text-white text-lg mb-2 truncate">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-4 h-4 text-[#00f3ff]" />
                        <span className="font-orbitron text-[#00f3ff] font-bold">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              updateCartItem(item.product_id, item.quantity - 1)
                            }
                            className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/10"
                            data-testid={`decrease-${item.product_id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-orbitron font-bold text-white w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              updateCartItem(item.product_id, item.quantity + 1)
                            }
                            className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/10"
                            data-testid={`increase-${item.product_id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          data-testid={`remove-${item.product_id}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="hidden sm:block text-right">
                      <p className="text-white/40 text-sm">Total</p>
                      <p className="font-orbitron font-bold text-white text-xl">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="glass-card rounded-2xl p-6 sticky top-28">
                <h2 className="font-orbitron font-bold text-white text-xl mb-6">
                  ORDER SUMMARY
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Processing Fee</span>
                    <span>$0.00</span>
                  </div>
                  <div className="border-t border-white/10 pt-4 flex justify-between">
                    <span className="font-orbitron font-bold text-white">Total</span>
                    <span className="font-orbitron font-bold text-[#00f3ff] text-xl">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || cart.length === 0}
                  className="w-full h-14 gradient-btn rounded-xl text-black font-bold text-lg mb-4"
                  data-testid="checkout-btn"
                >
                  {checkoutLoading ? (
                    <div className="spinner w-5 h-5 border-black"></div>
                  ) : (
                    <>
                      Proceed to Checkout
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span>Secure checkout with Stripe</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
