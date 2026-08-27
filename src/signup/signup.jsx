import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import "./signup.css";

function Signup() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const selectRole = (role) => {
    setFormData({
      ...formData,
      role,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");

      return;
    }

    if (!termsAccepted) {
      setMessage("Please accept the Terms & Conditions.");

      return;
    }

    if (!API_URL) {
      setMessage("The server address is not configured.");

      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          fullName: formData.fullName,

          email: formData.email,

          phone: formData.phone,

          password: formData.password,

          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to create account.");

        return;
      }

      /*
        ====================================
        SAVE LOGIN TOKEN
        ====================================
        */

      if (data.token) {
        localStorage.setItem("pataKaziToken", data.token);
      }

      /*
        ====================================
        SAVE USER INFORMATION
        ====================================
        */

      if (data.user) {
        localStorage.setItem("pataKaziUser", JSON.stringify(data.user));
      }

      setMessage("Account created successfully!");

      /*
        ====================================
        REDIRECT BASED ON ROLE
        ====================================
        */

      if (data.user?.role === "provider") {
        navigate("/provider");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Signup error:", error);

      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* BRAND */}

        <div className="signup-brand">
          <Link to="/" className="signup-logo">
            Pata Kazi
          </Link>

          <p>Find help. Find work. Get things done.</p>
        </div>

        {/* SIGNUP CARD */}

        <div className="signup-card">
          <div className="signup-header">
            <h1>Create your account</h1>

            <p>Join Pata Kazi and connect with people in your community.</p>
          </div>

          {/* ROLE SELECTION */}

          <div className="role-section">
            <p className="role-title">What would you like to do?</p>

            <div className="role-options">
              {/* CUSTOMER */}

              <button
                type="button"
                className={
                  formData.role === "customer"
                    ? "role-card active"
                    : "role-card"
                }
                onClick={() => selectRole("customer")}
              >
                <span className="role-card-title">Hire someone</span>

                <span className="role-card-description">
                  I need help getting something done.
                </span>
              </button>

              {/* PROVIDER */}

              <button
                type="button"
                className={
                  formData.role === "provider"
                    ? "role-card active"
                    : "role-card"
                }
                onClick={() => selectRole("provider")}
              >
                <span className="role-card-title">Find work</span>

                <span className="role-card-description">
                  I want to offer my skills and services.
                </span>
              </button>
            </div>
          </div>

          {/* MESSAGE */}

          {message && <div className="signup-message">{message}</div>}

          {/* FORM */}

          <form onSubmit={handleSubmit}>
            {/* NAME */}

            <div className="signup-form-group">
              <label htmlFor="fullName">Full name</label>

              <input
                id="fullName"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* EMAIL */}

            <div className="signup-form-group">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* PHONE */}

            <div className="signup-form-group">
              <label htmlFor="phone">Phone number</label>

              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="e.g. 0712345678"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* PASSWORD */}

            <div className="signup-form-group">
              <label htmlFor="password">Password</label>

              <div className="signup-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength="6"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="signup-form-group">
              <label htmlFor="confirmPassword">Confirm password</label>

              <div className="signup-password-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* TERMS */}

            <div className="terms">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />

              <label htmlFor="terms">
                I agree to the{" "}
                <Link to="/terms" className="terms-link">
                  Terms & Conditions
                </Link>{" "}
                and Privacy Policy
              </label>
            </div>

            {/* BUTTON */}

            <button
              type="submit"
              className="signup-button"
              disabled={isLoading}
            >
              {isLoading
                ? "Creating account..."
                : formData.role === "provider"
                  ? "Create provider account"
                  : "Create account"}
            </button>
          </form>

          <div className="signup-login">
            <p>
              Already have an account? <Link to="/">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
