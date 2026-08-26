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

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");

      return;
    }

    setIsLoading(true);

    try {
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

      console.log("SIGNUP RESPONSE:", data);

      if (!response.ok) {
        setMessage(data.message || "Unable to create account.");

        return;
      }

      setMessage("Account created successfully!");

      setTimeout(() => {
        navigate("/");
      }, 1200);
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
        <div className="signup-brand">
          <h1>Pata Kazi</h1>

          <p>Find work. Find help. Get things done.</p>
        </div>

        <div className="signup-card">
          <h2>Create your account</h2>

          <p className="signup-subtitle">
            Join Pata Kazi and get started today.
          </p>

          {message && <div className="signup-message">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="role-section">
              <p>I want to:</p>

              <div className="role-options">
                <label
                  className={
                    formData.role === "customer"
                      ? "role-card active-role"
                      : "role-card"
                  }
                >
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={formData.role === "customer"}
                    onChange={handleChange}
                  />

                  <span>Hire someone</span>

                  <small>I need help with a task</small>
                </label>

                <label
                  className={
                    formData.role === "provider"
                      ? "role-card active-role"
                      : "role-card"
                  }
                >
                  <input
                    type="radio"
                    name="role"
                    value="provider"
                    checked={formData.role === "provider"}
                    onChange={handleChange}
                  />

                  <span>Find work</span>

                  <small>I want to offer services</small>
                </label>
              </div>
            </div>

            <div className="form-group">
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

            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone number</label>

              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="e.g. 0712 345 678"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>

              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Enter your password again"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="show-password-button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="terms">
              <input type="checkbox" id="terms" required />

              <label htmlFor="terms">
                I agree to the{" "}
                <Link to="/terms" className="terms-link">
                  Terms & Conditions
                </Link>{" "}
                and Privacy Policy
              </label>
            </div>

            <button
              type="submit"
              className="signup-button"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <button type="button" className="google-button">
            Continue with Google
          </button>

          <p className="login-text">
            Already have an account? <Link to="/">Sign in</Link>
          </p>

          <p className="home-link-text">
            <Link to="/home">Continue to homepage</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Signup;
