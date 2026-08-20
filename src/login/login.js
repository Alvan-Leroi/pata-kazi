// src/pages/Login.jsx

import React, { useState } from "react";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login data:", formData);

    // Later, we will connect this to the backend
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <h1>TaskLink</h1>
          <p>Find help. Get things done.</p>
        </div>

        <div className="login-card">
          <h2>Welcome back</h2>
          <p className="login-subtitle">Sign in to continue to your account.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <div className="password-label">
                <label>Password</label>

                <a href="/forgot-password">Forgot password?</a>
              </div>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>

            <button type="submit" className="login-button">
              Sign in
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <button className="google-button">Continue with Google</button>

          <p className="signup-text">
            Don't have an account? <a href="/register">Create account</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
