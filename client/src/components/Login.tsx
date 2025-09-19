import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import WeConnectLogo from "../assets/logo.png";
import { toast } from "react-toastify";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rememberMe, setRememberMe] = useState<boolean>(
    () => localStorage.getItem("rememberMe") === "true"
  );

  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Do not show toast for auth errors

  // Prefill email from localStorage when Remember Me is enabled
  useEffect(() => {
    if (rememberMe) {
      const savedEmail = localStorage.getItem("rememberedEmail") || "";
      if (savedEmail) {
        setFormData((prev) => ({ ...prev, email: savedEmail }));
      }
    }
  }, [rememberMe]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login(formData);
      // Persist or clear remembered email based on preference
      localStorage.setItem("rememberMe", String(rememberMe));
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      navigate("/", { replace: true });
    } catch (err) {
      const anyErr: any = err;
      const message =
        anyErr?.response?.data?.message || anyErr?.message || "Invalid credentials";
      toast.error(message, { toastId: "login_invalid" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2B2C2B] via-[#1E1F1F] to-black py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Brand radial glows */}
      <div className="pointer-events-none absolute -top-28 -left-28 h-[28rem] w-[28rem] rounded-full bg-[#EF444E] opacity-30 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-28 -right-28 h-[30rem] w-[30rem] rounded-full bg-white opacity-[0.08] blur-3xl"></div>
      <div className="pointer-events-none absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-[#EF444E] opacity-10 blur-2xl"></div>

      <div className="relative max-w-md w-full">
        {/* Glass card */}
        <div className="rounded-3xl border border-white/15 bg-white/10 dark:bg-white/5 backdrop-blur-2xl shadow-2xl p-4">
          {/* Header */}
          <div className="text-center">
            <img
              src={WeConnectLogo}
              alt="WeConnect"
              className="mx-auto w-60  mb-4"
            />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Sign in to your CRM account
            </p>
          </div>

          {/* Error is shown via toast only */}

          {/* Form */}
          <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white " />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 rounded-xl border bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#EF444E] focus:border-transparent transition-colors ${
                    errors.email
                      ? "border-red-400/60"
                      : "border-white/20 hover:border-white/30"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-3 rounded-xl border bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#EF444E] focus:border-transparent transition-colors ${
                    errors.password
                      ? "border-red-400/60"
                      : "border-white/20 hover:border-white/30"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-white" />
                  ) : (
                    <Eye className="h-5 w-5 text-white" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Options row */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-white/80 select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/30 bg-white/10 accent-[#EF444E] focus:ring-0 focus:outline-none"
                  checked={rememberMe}
                  onChange={(e) => {
                    const value = e.target.checked;
                    setRememberMe(value);
                    localStorage.setItem("rememberMe", String(value));
                    if (!value) localStorage.removeItem("rememberedEmail");
                  }}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="text-sm font-medium text-[#EF444E] hover:text-[#ff6972] hover:underline"
                onClick={() => {
                  const email =
                    formData.email ||
                    localStorage.getItem("rememberedEmail") ||
                    "";
                  const mailto = `mailto:support@example.com?subject=Password%20reset%20request&body=My%20login%20email:%20${encodeURIComponent(
                    email
                  )}`;
                  window.location.href = mailto;
                }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 rounded-full text-sm font-semibold text-white bg-[#EF444E] hover:bg-[#e63b46] focus:outline-none focus:ring-2 focus:ring-[#EF444E]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-white/60">
            <p>Secure CRM Authentication System</p>
            <p className="mt-1">Built with React, Node.js & JWT</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
