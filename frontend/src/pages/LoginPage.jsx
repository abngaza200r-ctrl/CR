import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, formData);
      login(response.data.user, response.data.token);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-full gradient-btn flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
          </Link>
          <h1 className="font-orbitron text-3xl font-bold text-white mb-2">
            WELCOME <span className="gradient-text">BACK</span>
          </h1>
          <p className="text-white/50">Sign in to your account</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8"
        >
          {/* Google Login */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full h-12 rounded-xl border-white/20 text-white hover:bg-white/10 mb-6"
            data-testid="google-login"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-white/40 text-sm bg-[#0a0a1a]">or</span>
            </div>
          </div>

          {/* Email Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl"
                  data-testid="login-email"
                />
              </div>
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl"
                  data-testid="login-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 gradient-btn rounded-xl text-black font-bold mt-6"
              data-testid="login-submit"
            >
              {loading ? (
                <div className="spinner w-5 h-5 border-black"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-white/50 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#00f3ff] hover:underline" data-testid="goto-register">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
