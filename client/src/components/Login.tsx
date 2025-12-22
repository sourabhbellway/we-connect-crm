import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useBusinessSettings } from "../contexts/BusinessSettingsContext";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import WeConnectLogo from "../assets/logo.png";
import { toast } from "react-toastify";
import MustChangePasswordModal from "./MustChangePasswordModal";

// Validation constraints
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 64;


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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const { login, isLoading, error: authError, clearError, user } = useAuth();
  const { companySettings } = useBusinessSettings();
  const navigate = useNavigate();

  // Show password modal when user needs to change password
  useEffect(() => {
    if (user?.mustChangePassword) {
      setShowPasswordModal(true);
    }
  }, [user?.mustChangePassword]);

  // Prefill email from localStorage when Remember Me is enabled
  useEffect(() => {
    if (rememberMe) {
      const savedEmail = localStorage.getItem("rememberedEmail") || "";
      if (savedEmail) {
        setFormData((prev) => ({ ...prev, email: savedEmail }));
      }
    }
  }, [rememberMe]);

  // Sync auth error from context into local submitError display
  useEffect(() => {
    if (authError) {
      setSubmitError(authError);
    }
  }, [authError]);

const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const email = formData.email.trim();
    const password = formData.password.trim();

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } 

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return false;
    }
    return true;
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return; // prevent multiple submits

    // Trim inputs before validation and submission
    const trimmed = {
      email: formData.email.trim(),
      password: formData.password.trim(),
    };
    // Reflect trimmed values in UI state
    if (trimmed.email !== formData.email || trimmed.password !== formData.password) {
      setFormData(trimmed);
    }

    if (!validateForm()) return;

    try {
      setSubmitError(null);
      await login(trimmed);
      // Persist or clear remembered email based on preference
      localStorage.setItem("rememberMe", String(rememberMe));
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      // Don't navigate here - let the modal handle it if mustChangePassword is true
      // Otherwise navigate after the effect
    } catch (err) {
      const anyErr: any = err;
      const message =
        anyErr?.response?.data?.message || anyErr?.message || "Invalid credentials";
      // Show inline error only (avoid duplicate toast + inline)
      setSubmitError(message);
    }
  };

  // Navigate to dashboard if password change not required
  useEffect(() => {
    if (user && !user.mustChangePassword) {
      navigate("/", { replace: true });
    }
  }, [user?.mustChangePassword, user, navigate]);

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear submit/auth errors on new input
    if (submitError) setSubmitError(null);
    if (authError) clearError();
  };

  const handleTrimOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const trimmed = value.trim();
    if (trimmed !== value) {
      setFormData((prev) => ({ ...prev, [name]: trimmed }));
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Modern background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-weconnect-red opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-500 opacity-10 blur-3xl"></div>
        <div className="absolute top-1/2 -right-20 h-60 w-60 rounded-full bg-purple-500 opacity-15 blur-2xl"></div>
        <div className="absolute top-1/4 -left-20 h-40 w-40 rounded-full bg-cyan-400 opacity-20 blur-2xl"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Modern glass card */}
        <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
          
          {/* Header */}
          <div className="relative text-center mb-6">
            <div className="mb-6">
              {companySettings?.logo ? (
                <img
                  src={companySettings.logo}
                  alt={companySettings.name || "CRM"}
                  className="mx-auto max-w-[200px] max-h-[80px] w-auto h-auto object-contain"
                />
              ) : (
                <img
                  src={WeConnectLogo}
                  alt="WeConnect"
                  className="mx-auto w-48 h-auto"
                />
              )}
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-base text-white/60">
              Sign in to {companySettings?.name ? `${companySettings.name} CRM` : 'your CRM dashboard'}
            </p>
          </div>

          {/* Inline error message */}
          {(submitError || authError) && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 px-4 py-3">
              <p className="text-sm">{submitError || authError}</p>
            </div>
          )}

          {/* Form */}
          <form className="relative space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-white/90 mb-3"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white/60 group-focus-within:text-weconnect-red transition-colors" />
                </div>
<input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
      
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleTrimOnBlur}
                  className={`block w-full pl-12 pr-4 py-4 rounded-xl border-2 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-weconnect-red/50 focus:border-weconnect-red backdrop-blur-sm transition-all duration-200 ${
                    errors.email
                      ? "border-red-400/60 ring-red-400/20"
                      : "border-white/10 hover:border-white/20 hover:bg-white/10"
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-white/90 mb-3"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/60 group-focus-within:text-weconnect-red transition-colors" />
                </div>
<input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  maxLength={MAX_PASSWORD_LENGTH}
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleTrimOnBlur}
                  className={`block w-full pl-12 pr-12 py-4 rounded-xl border-2 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-weconnect-red/50 focus:border-weconnect-red backdrop-blur-sm transition-all duration-200 ${
                    errors.password
                      ? "border-red-400/60 ring-red-400/20"
                      : "border-white/10 hover:border-white/20 hover:bg-white/10"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-weconnect-red transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-white/60" />
                  ) : (
                    <Eye className="h-5 w-5 text-white/60" />
                  )}
                </button>
              </div>
              {/* {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
              )} */}
            </div>

            {/* Options row */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-3 text-sm text-white/70 select-none cursor-pointer hover:text-white/90 transition-colors">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-weconnect-red focus:ring-weconnect-red focus:ring-offset-0 focus:ring-2 transition-all"
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
                className="text-sm font-medium text-weconnect-red hover:text-red-400 transition-colors"
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
              aria-disabled={isLoading}
              aria-busy={isLoading}
              className="w-full flex justify-center items-center py-4 px-6 mt-8 rounded-xl text-base font-semibold text-white bg-weconnect-red hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-weconnect-red/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Password Change Modal */}
      <MustChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onNavigateToProfile={() => navigate("/", { replace: true })}
      />
    </div>
  );
};

export default Login;
