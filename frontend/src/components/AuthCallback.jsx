import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { API } from "../App";
import axios from "axios";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use ref to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);

      if (!sessionIdMatch) {
        navigate("/login", { replace: true });
        return;
      }

      const sessionId = sessionIdMatch[1];

      try {
        const response = await axios.post(
          `${API}/auth/session`,
          { session_id: sessionId },
          { withCredentials: true }
        );

        const { user, token } = response.data;
        localStorage.setItem("token", token);
        setUser(user);

        // Clear hash and navigate to dashboard
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/dashboard", { replace: true, state: { user } });
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/login", { replace: true });
      }
    };

    processAuth();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center">
      <div className="text-center">
        <div className="spinner w-16 h-16 mx-auto mb-6"></div>
        <p className="text-white/60 font-manrope">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
