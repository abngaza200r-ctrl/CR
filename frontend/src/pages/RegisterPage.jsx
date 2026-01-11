import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/register`, formData);
      login(response.data.user, response.data.token);
      toast.success("Account created successfully!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration failed");
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
            CREATE <span className="gradient-text">ACCOUNT</span>
          </h1>
          <p className="text-white/50">Join thousands of happy customers</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8"
        >
          {/* Google Signup */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full h-12 rounded-xl border-white/20 text-white hover:bg-white/10 mb-6"
            data-testid="google-signup"
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

          {/* Email Registration */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl"
                  data-testid="register-name"
                />
              </div>
            </div>

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
                  data-testid="register-email"
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
                  minLength={6}
                  className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl"
                  data-testid="register-password"
                />
              </div>
              <p className="text-white/30 text-xs mt-1">Minimum 6 characters</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 gradient-btn rounded-xl text-black font-bold mt-6"
              data-testid="register-submit"
            >
              {loading ? (
                <div className="spinner w-5 h-5 border-black"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-white/50 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#00f3ff] hover:underline" data-testid="goto-login">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
