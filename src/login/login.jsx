import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import "./login.css";

function Login() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);

  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");

      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email.trim(),

          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to sign in.");

        return;
      }

      localStorage.setItem("pataKaziToken", data.token);

      localStorage.setItem("pataKaziUser", JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem("pataKaziRememberEmail", email.trim());
      } else {
        localStorage.removeItem("pataKaziRememberEmail");
      }

      if (data.user?.role === "provider") {
        navigate("/provider");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Login error:", error);

      setMessage("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    setMessage("Password reset is coming soon.");
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-brand-section">
          <Link to="/" className="login-brand">
            Pata Kazi
          </Link>

          <p className="login-tagline">
            Find help. Find work. Get things done.
          </p>
        </div>

        <main className="login-card">
          <div className="login-heading">
            <h1>Welcome back</h1>

            <p>Sign in to continue to your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <div className="login-password-label-row">
                <label htmlFor="password">Password</label>

                <button
                  type="button"
                  className="login-forgot-button"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>

              <div className="login-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />

                <span>Remember me</span>
              </label>
            </div>

            {message && <div className="login-message">{message}</div>}

            <button
              type="submit"
              className="login-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="login-google-button"
            onClick={() => setMessage("Google sign-in is coming soon.")}
          >
            Continue with Google
          </button>

          <div className="login-footer">
            <span>Don't have an account?</span>

            <Link to="/signup">Create account</Link>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Login;
