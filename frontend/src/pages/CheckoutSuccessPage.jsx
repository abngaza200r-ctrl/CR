import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API, useCart } from "../App";
import { CheckCircle, XCircle, Package, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState("loading"); // loading, success, failed
  const [paymentData, setPaymentData] = useState(null);
  const hasPolled = useRef(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (!sessionId) {
      navigate("/cart");
      return;
    }

    if (hasPolled.current) return;
    hasPolled.current = true;

    const pollPaymentStatus = async (attempts = 0) => {
      const maxAttempts = 10;
      const pollInterval = 2000;

      if (attempts >= maxAttempts) {
        setStatus("timeout");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API}/checkout/status/${sessionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        setPaymentData(response.data);

        if (response.data.payment_status === "paid") {
          setStatus("success");
          clearCart();
          return;
        } else if (response.data.status === "expired") {
          setStatus("failed");
          return;
        }

        // Continue polling
        setTimeout(() => pollPaymentStatus(attempts + 1), pollInterval);
      } catch (error) {
        console.error("Error checking payment status:", error);
        setTimeout(() => pollPaymentStatus(attempts + 1), pollInterval);
      }
    };

    pollPaymentStatus();
  }, [searchParams, navigate, clearCart]);

  if (status === "loading") {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#00f3ff] mx-auto mb-6 animate-spin" />
          <h2 className="font-orbitron text-2xl font-bold text-white mb-2">
            Processing Payment
          </h2>
          <p className="text-white/50">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "failed" || status === "timeout") {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="font-orbitron text-2xl font-bold text-white mb-4">
            Payment {status === "timeout" ? "Timeout" : "Failed"}
          </h2>
          <p className="text-white/50 mb-8">
            {status === "timeout"
              ? "We couldn't confirm your payment. Please check your email or contact support."
              : "Your payment could not be processed. Please try again."}
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/cart">
              <Button className="gradient-btn rounded-full px-8 text-black font-bold">
                Return to Cart
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="outline"
                className="rounded-full px-8 border-white/20 text-white hover:bg-white/10"
              >
                Contact Support
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Success Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto animate-pulse-glow">
              <CheckCircle className="w-14 h-14 text-green-400" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#00f3ff] flex items-center justify-center"
              style={{ left: "calc(50% + 30px)" }}
            >
              <span className="text-black font-bold">✓</span>
            </motion.div>
          </div>

          <h1 className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4">
            PAYMENT <span className="text-green-400">SUCCESSFUL</span>
          </h1>
          <p className="text-white/60 text-lg mb-8">
            Thank you for your purchase! Your order has been confirmed.
          </p>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 mb-8 text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-[#00f3ff]" />
              <h2 className="font-orbitron font-bold text-white">Order Details</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-white/60">
                <span>Status</span>
                <span className="text-green-400 font-medium">Paid</span>
              </div>
              {paymentData && (
                <>
                  <div className="flex justify-between text-white/60">
                    <span>Amount</span>
                    <span className="text-white font-medium">
                      ${(paymentData.amount_total / 100).toFixed(2)} {paymentData.currency?.toUpperCase()}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-white/60">
                <span>Delivery</span>
                <span className="text-white font-medium">Processing</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#00f3ff]/10 rounded-xl border border-[#00f3ff]/20">
              <p className="text-[#00f3ff] text-sm">
                Your digital products will be delivered to your email shortly. 
                Check your dashboard for order status updates.
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard" data-testid="go-to-dashboard">
              <Button className="gradient-btn rounded-full px-8 py-6 text-black font-bold">
                View Orders
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/services" data-testid="continue-shopping">
              <Button
                variant="outline"
                className="rounded-full px-8 py-6 border-white/20 text-white hover:bg-white/10"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
