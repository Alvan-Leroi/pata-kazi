import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import "./signup.css";

function Signup() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [role, setRole] = useState("customer");

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreed, setAgreed] = useState(false);

  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setMessage("Please complete all fields.");

      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");

      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");

      return;
    }

    if (!agreed) {
      setMessage("Please agree to the Terms & Conditions.");

      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          fullName: fullName.trim(),

          email: email.trim(),

          phone: phone.trim(),

          password,

          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to create account.");

        return;
      }

      if (data.token) {
        localStorage.setItem("pataKaziToken", data.token);
      }

      if (data.user) {
        localStorage.setItem("pataKaziUser", JSON.stringify(data.user));
      }

      if (data.user?.role === "provider") {
        navigate("/provider");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Signup error:", error);

      setMessage("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-background-glow signup-glow-one"></div>

      <div className="signup-background-glow signup-glow-two"></div>

      <main className="signup-card">
        <div className="signup-brand">
          <Link to="/">Pata Kazi</Link>
        </div>

        <div className="signup-heading">
          <p className="signup-eyebrow">Join the community</p>

          <h1>Create your account</h1>

          <p>Join Pata Kazi and connect with people in your community.</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="signup-role-section">
            <label className="signup-main-label">
              What would you like to do?
            </label>

            <div className="signup-role-grid">
              <button
                type="button"
                className={`signup-role-card ${
                  role === "customer" ? "signup-role-card-active" : ""
                }`}
                onClick={() => setRole("customer")}
              >
                <span className="signup-role-title">Hire someone</span>

                <span className="signup-role-description">
                  I need help getting something done.
                </span>
              </button>

              <button
                type="button"
                className={`signup-role-card ${
                  role === "provider" ? "signup-role-card-active" : ""
                }`}
                onClick={() => setRole("provider")}
              >
                <span className="signup-role-title">Find work</span>

                <span className="signup-role-description">
                  I want to offer my skills and services.
                </span>
              </button>
            </div>
          </div>

          <div className="signup-field">
            <label htmlFor="fullName">Full name</label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>

          <div className="signup-field">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="signup-field">
            <label htmlFor="phone">Phone number</label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="e.g. 0712345678"
              autoComplete="tel"
            />
          </div>

          <div className="signup-field">
            <label htmlFor="password">Password</label>

            <div className="signup-password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="signup-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="signup-field">
            <label htmlFor="confirmPassword">Confirm password</label>

            <div className="signup-password-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="signup-password-toggle"
                onClick={() => setShowConfirmPassword((current) => !current)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <label className="signup-checkbox-row">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />

            <span>
              I agree to the <Link to="/terms">Terms & Conditions</Link> and
              Privacy Policy
            </span>
          </label>

          {message && <div className="signup-message">{message}</div>}

          <button
            type="submit"
            className="signup-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="signup-footer">
          <span>Already have an account?</span>

          <Link to="/">Sign in</Link>
        </div>
      </main>
    </div>
  );
}

export default Signup;
