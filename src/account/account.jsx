import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./account.css";

function Account() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    fullName: "John Doe",
    email: "john@example.com",
    phone: "0712 345 678",
    location: "Nairobi, Kenya",
    role: "Customer",
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

    console.log("Updated user:", user);

    setIsEditing(false);
  };

  const handleLogout = () => {
    navigate("/");
  };

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
        <div className="account-header">
          <div>
            <p className="account-label">Account</p>

            <h1>My Profile</h1>

            <p>
              Manage your personal information and account settings.
            </p>
          </div>
        </div>

        <div className="account-grid">
          <aside className="profile-summary">
            <div className="profile-avatar">
              {user.fullName.charAt(0)}
            </div>

            <h2>{user.fullName}</h2>

            <p>{user.email}</p>

            <span className="account-role">
              {user.role}
            </span>

            <div className="summary-divider"></div>

            <div className="profile-stat">
              <span>Location</span>
              <strong>{user.location}</strong>
            </div>

            <div className="profile-stat">
              <span>Phone</span>
              <strong>{user.phone}</strong>
            </div>
          </aside>

          <section className="account-content">
            <div className="account-card">
              <div className="card-header">
                <div>
                  <h2>Personal information</h2>
                  <p>
                    Update your account details.
                  </p>
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit profile
                  </button>
                )}
              </div>

              <form onSubmit={handleSave}>
                <div className="account-form-grid">
                  <div className="account-form-group">
                    <label htmlFor="fullName">
                      Full name
                    </label>

                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      value={user.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="account-form-group">
                    <label htmlFor="email">
                      Email address
                    </label>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={user.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="account-form-group">
                    <label htmlFor="phone">
                      Phone number
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={user.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="account-form-group">
                    <label htmlFor="location">
                      Location
                    </label>

                    <input
                      id="location"
                      type="text"
                      name="location"
                      value={user.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="account-form-group full-width">
                    <label htmlFor="role">
                      Account type
                    </label>

                    <select
                      id="role"
                      name="role"
                      value={user.role}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="Customer">
                        Customer
                      </option>

                      <option value="Service Provider">
                        Service Provider
                      </option>
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

                    <button
                      type="submit"
                      className="save-button"
                    >
                      Save changes
                    </button>
                  </div>
                )}
              </form>
            </div>

            <div className="account-card">
              <div className="card-header">
                <div>
                  <h2>Password & Security</h2>

                  <p>
                    Manage your password and account security.
                  </p>
                </div>
              </div>

              <div className="security-row">
                <div>
                  <h3>Password</h3>

                  <p>
                    Update your password regularly to keep your
                    account secure.
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-account-button"
                >
                  Change password
                </button>
              </div>
            </div>

            <div className="account-card danger-card">
              <div className="card-header">
                <div>
                  <h2>Account actions</h2>

                  <p>
                    Manage your account session.
                  </p>
                </div>
              </div>

              <div className="security-row">
                <div>
                  <h3>Log out</h3>

                  <p>
                    Sign out of your Pata Kazi account.
                  </p>
                </div>

                <button
                  type="button"
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Log out
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