import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!API_URL) {
      setMessage("The server address is not configured.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to sign in.");
        return;
      }

      localStorage.setItem("pataKaziToken", data.token);

      localStorage.setItem("pataKaziUser", JSON.stringify(data.user));

      /*
      ========================================
      SEND USER TO THE CORRECT DASHBOARD
      ========================================
      */

      if (data.user?.role === "provider") {
        navigate("/provider");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Login error:", error);

      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        {/* BRAND */}
        <div className="login-brand">
          <Link to="/" className="login-brand-title">
            Pata Kazi
          </Link>

          <p>Find help. Find work. Get things done.</p>
        </div>

        {/* LOGIN CARD */}
        <div className="login-card">
          <div className="login-card-header">
            <h1>Welcome back</h1>

            <p>Sign in to continue to your account.</p>
          </div>

          {message && <div className="login-message">{message}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            {/* EMAIL */}
            <div className="login-field">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="login-field">
              <div className="login-password-label">
                <label htmlFor="password">Password</label>

                <button type="button" className="forgot-password-button">
                  Forgot password?
                </button>
              </div>

              <div className="login-password-input">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="show-password-button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* REMEMBER */}
            <label className="remember-row">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />

              <span>Remember me</span>
            </label>

            {/* SIGN IN */}
            <button
              type="submit"
              className="login-submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="login-divider">
            <span></span>
            <p>OR</p>
            <span></span>
          </div>

          {/* GOOGLE */}
          <button type="button" className="google-login-button">
            Continue with Google
          </button>

          {/* SIGNUP */}
          <div className="login-create-account">
            <span>Don't have an account?</span>

            <Link to="/signup">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
