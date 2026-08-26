import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./account.css";

function Account() {
  const navigate = useNavigate();

  const savedUser = JSON.parse(localStorage.getItem("pataKaziUser"));

  const [user, setUser] = useState({
    fullName: savedUser?.fullName || "Pata Kazi User",
    email: savedUser?.email || "",
    phone: savedUser?.phone || "",
    role: savedUser?.role || "customer",
    location: savedUser?.location || "Nairobi, Kenya",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();

    localStorage.setItem("pataKaziUser", JSON.stringify(user));

    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("pataKaziToken");
    localStorage.removeItem("pataKaziUser");

    navigate("/");
  };

  const roleLabel = user.role === "provider" ? "Service Provider" : "Customer";

  return (
    <div className="account-page">
      <nav className="account-navbar">
        <div className="account-nav-container">
          <Link to="/home" className="account-logo">
            Pata Kazi
          </Link>

          <div className="account-nav-links">
            <Link to="/home">Home</Link>

            <Link to="/account" className="active-nav-link">
              My Account
            </Link>

            <button
              type="button"
              className="logout-nav-button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="account-main">
        <section className="profile-hero">
          <div className="profile-avatar-large">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="profile-hero-info">
            <p className="profile-small-label">My Account</p>

            <h1>{user.fullName}</h1>

            <div className="profile-meta">
              <span>{roleLabel}</span>

              <span>{user.location}</span>
            </div>
          </div>

          <button
            type="button"
            className="edit-profile-main"
            onClick={() => setIsEditing(true)}
          >
            Edit profile
          </button>
        </section>

        <section className="account-stats">
          <div className="stat-card">
            <span>0</span>
            <p>Tasks posted</p>
          </div>

          <div className="stat-card">
            <span>0</span>
            <p>Tasks completed</p>
          </div>

          <div className="stat-card">
            <span>0</span>
            <p>Reviews</p>
          </div>

          <div className="stat-card">
            <span>New</span>
            <p>Account status</p>
          </div>
        </section>

        <div className="account-layout">
          <aside className="account-sidebar">
            <button className="sidebar-item active-sidebar">Profile</button>

            <button className="sidebar-item">My Tasks</button>

            <button className="sidebar-item">Saved Services</button>

            <button className="sidebar-item">Reviews</button>

            <button className="sidebar-item">Security</button>
          </aside>

          <section className="account-content">
            <div className="account-card">
              <div className="card-header">
                <div>
                  <h2>Personal information</h2>

                  <p>Manage your personal details and account information.</p>
                </div>
              </div>

              <form onSubmit={handleSave}>
                <div className="account-form-grid">
                  <div className="account-form-group">
                    <label>Full name</label>

                    <input
                      type="text"
                      name="fullName"
                      value={user.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="account-form-group">
                    <label>Email address</label>

                    <input
                      type="email"
                      name="email"
                      value={user.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="account-form-group">
                    <label>Phone number</label>

                    <input
                      type="tel"
                      name="phone"
                      value={user.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="account-form-group">
                    <label>Location</label>

                    <input
                      type="text"
                      name="location"
                      value={user.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="account-form-group full-width">
                    <label>Account type</label>

                    <select
                      name="role"
                      value={user.role}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="customer">Customer</option>

                      <option value="provider">Service Provider</option>
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>

                    <button type="submit" className="save-button">
                      Save changes
                    </button>
                  </div>
                )}
              </form>
            </div>

            <div className="account-card">
              <div className="card-header">
                <div>
                  <h2>Account activity</h2>

                  <p>Your recent activity on Pata Kazi will appear here.</p>
                </div>
              </div>

              <div className="empty-state">
                <h3>No activity yet</h3>

                <p>
                  Start using Pata Kazi and your tasks, jobs, and activity will
                  appear here.
                </p>

                <Link to="/home" className="browse-button">
                  Browse services
                </Link>
              </div>
            </div>

            <div className="account-card">
              <div className="security-row">
                <div>
                  <h3>Password & Security</h3>

                  <p>
                    Keep your account secure by regularly updating your
                    password.
                  </p>
                </div>

                <button type="button" className="secondary-account-button">
                  Change password
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Account;
