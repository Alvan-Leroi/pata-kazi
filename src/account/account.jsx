import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./account.css";

function Account() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("pataKaziToken");

  const savedUser = JSON.parse(localStorage.getItem("pataKaziUser"));

  const [activeSection, setActiveSection] = useState("overview");

  const [myTasks, setMyTasks] = useState([]);

  const [tasksLoading, setTasksLoading] = useState(false);

  const [tasksMessage, setTasksMessage] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const loadTasks = async () => {
      if (!API_URL) {
        setTasksMessage("The API address is not configured.");
        return;
      }

      try {
        setTasksLoading(true);
        setTasksMessage("");

        const response = await fetch(`${API_URL}/api/tasks/mine`, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setTasksMessage(data.message || "Unable to load your tasks.");

          return;
        }

        setMyTasks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Account task loading error:", error);

        setTasksMessage("Unable to load your tasks.");
      } finally {
        setTasksLoading(false);
      }
    };

    loadTasks();
  }, [API_URL, navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("pataKaziToken");

    localStorage.removeItem("pataKaziUser");

    navigate("/");
  };

  const formatBudget = (budget) => {
    return Number(budget || 0).toLocaleString();
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    return new Date(dateValue).toLocaleDateString();
  };

  const totalTasks = myTasks.length;

  const openTasks = myTasks.filter((task) => task.status === "open").length;

  const completedTasks = myTasks.filter(
    (task) => task.status === "completed",
  ).length;

  const renderOverview = () => {
    return (
      <div className="account-section-content">
        <div className="account-section-heading">
          <p className="account-section-label">Dashboard</p>

          <h2>Welcome back, {savedUser?.fullName?.split(" ")[0] || "there"}</h2>

          <p>
            Manage your tasks, saved services, reviews, and account settings.
          </p>
        </div>

        <div className="account-stats-grid">
          <button
            type="button"
            className="account-stat-card"
            onClick={() => setActiveSection("tasks")}
          >
            <span className="stat-number">{totalTasks}</span>

            <span className="stat-label">Tasks posted</span>
          </button>

          <button
            type="button"
            className="account-stat-card"
            onClick={() => setActiveSection("tasks")}
          >
            <span className="stat-number">{openTasks}</span>

            <span className="stat-label">Open tasks</span>
          </button>

          <button
            type="button"
            className="account-stat-card"
            onClick={() => setActiveSection("tasks")}
          >
            <span className="stat-number">{completedTasks}</span>

            <span className="stat-label">Completed</span>
          </button>

          <button
            type="button"
            className="account-stat-card"
            onClick={() => setActiveSection("reviews")}
          >
            <span className="stat-number">0</span>

            <span className="stat-label">Reviews</span>
          </button>
        </div>

        <div className="account-dashboard-grid">
          <div className="account-dashboard-card">
            <div className="dashboard-card-header">
              <div>
                <p className="account-section-label">Recent activity</p>

                <h3>Recent Tasks</h3>
              </div>

              <button
                type="button"
                className="text-button"
                onClick={() => setActiveSection("tasks")}
              >
                View all
              </button>
            </div>

            {tasksLoading ? (
              <div className="account-empty-small">Loading your tasks...</div>
            ) : myTasks.length === 0 ? (
              <div className="account-empty-small">
                <p>You haven't posted a task yet.</p>

                <Link to="/post-task" className="account-small-button">
                  Post a task
                </Link>
              </div>
            ) : (
              <div className="recent-task-list">
                {myTasks.slice(0, 3).map((task) => (
                  <div className="recent-task-item" key={task._id}>
                    <div>
                      <h4>{task.title}</h4>

                      <p>
                        {task.category} • {task.location}
                      </p>
                    </div>

                    <span
                      className={`account-task-status status-${task.status}`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="account-dashboard-card">
            <p className="account-section-label">Quick actions</p>

            <h3>What would you like to do?</h3>

            <div className="quick-actions">
              <Link to="/post-task" className="quick-action-primary">
                Post a new task
              </Link>

              <button
                type="button"
                className="quick-action-secondary"
                onClick={() => setActiveSection("saved")}
              >
                View saved services
              </button>

              <button
                type="button"
                className="quick-action-secondary"
                onClick={() => setActiveSection("reviews")}
              >
                View reviews
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTasks = () => {
    return (
      <div className="account-section-content">
        <div className="account-section-heading account-section-heading-row">
          <div>
            <p className="account-section-label">Customer activity</p>

            <h2>My Tasks</h2>

            <p>View jobs you have posted and check for available providers.</p>
          </div>

          <Link to="/post-task" className="account-primary-button">
            + Post a new task
          </Link>
        </div>

        {tasksLoading && (
          <div className="account-empty-state">Loading your tasks...</div>
        )}

        {!tasksLoading && tasksMessage && (
          <div className="account-empty-state">{tasksMessage}</div>
        )}

        {!tasksLoading && !tasksMessage && myTasks.length === 0 && (
          <div className="account-empty-state">
            <div className="account-empty-icon">+</div>

            <h3>No tasks posted yet</h3>

            <p>Post a job and it will appear here.</p>

            <Link to="/post-task" className="account-primary-button">
              Post your first task
            </Link>
          </div>
        )}

        {!tasksLoading && !tasksMessage && myTasks.length > 0 && (
          <div className="account-task-grid">
            {myTasks.map((task) => (
              <article className="account-task-card" key={task._id}>
                <div className="account-task-top">
                  <span className={`account-task-status status-${task.status}`}>
                    {task.status || "open"}
                  </span>

                  <span className="account-task-date">
                    {formatDate(task.createdAt)}
                  </span>
                </div>

                <h3>{task.title}</h3>

                <p className="account-task-description">{task.description}</p>

                <div className="account-task-details">
                  <span>{task.category}</span>

                  <span>{task.location}</span>

                  <span>KES {formatBudget(task.budget)}</span>
                </div>

                <Link
                  to={`/task/${task._id}/providers`}
                  className="account-provider-button"
                >
                  View available providers
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSavedServices = () => {
    return (
      <div className="account-section-content">
        <div className="account-section-heading">
          <p className="account-section-label">Favorites</p>

          <h2>Saved Services</h2>

          <p>
            Providers and services you save will appear here so you can find
            them again quickly.
          </p>
        </div>

        <div className="account-empty-state">
          <div className="account-empty-icon">♡</div>

          <h3>Nothing saved yet</h3>

          <p>
            When you find a provider or service you like, you will be able to
            save it here.
          </p>

          <Link to="/home" className="account-primary-button">
            Browse services
          </Link>
        </div>
      </div>
    );
  };

  const renderReviews = () => {
    return (
      <div className="account-section-content">
        <div className="account-section-heading">
          <p className="account-section-label">Feedback</p>

          <h2>Reviews</h2>

          <p>Reviews connected to your completed tasks will appear here.</p>
        </div>

        <div className="account-empty-state">
          <div className="account-empty-icon">★</div>

          <h3>No reviews yet</h3>

          <p>
            Once a task is completed, you will be able to leave feedback for the
            provider who helped you.
          </p>
        </div>
      </div>
    );
  };

  const renderSecurity = () => {
    return (
      <div className="account-section-content">
        <div className="account-section-heading">
          <p className="account-section-label">Account protection</p>

          <h2>Security</h2>

          <p>
            Review your sign-in information and manage access to your Pata Kazi
            account.
          </p>
        </div>

        <div className="security-grid">
          <div className="security-card">
            <div className="security-card-header">
              <div className="security-icon">@</div>

              <div>
                <h3>Email address</h3>

                <p>Your account sign-in email.</p>
              </div>
            </div>

            <div className="security-value">
              {savedUser?.email || "Not available"}
            </div>
          </div>

          <div className="security-card">
            <div className="security-card-header">
              <div className="security-icon">●</div>

              <div>
                <h3>Password</h3>

                <p>Your password is securely stored and is not visible.</p>
              </div>
            </div>

            <div className="security-value">••••••••••••</div>
          </div>

          <div className="security-card">
            <div className="security-card-header">
              <div className="security-icon">✓</div>

              <div>
                <h3>Account status</h3>

                <p>Your current Pata Kazi account session.</p>
              </div>
            </div>

            <div className="security-status">Signed in</div>
          </div>

          <div className="security-card">
            <div className="security-card-header">
              <div className="security-icon">↪</div>

              <div>
                <h3>Sign out</h3>

                <p>End your current session on this device.</p>
              </div>
            </div>

            <button
              type="button"
              className="security-logout-button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>

        <div className="security-note">
          <strong>Password management</strong>

          <p>
            We can add a secure Change Password feature next. That requires a
            backend endpoint so the password can be verified and updated safely
            in MongoDB.
          </p>
        </div>
      </div>
    );
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "tasks":
        return renderTasks();

      case "saved":
        return renderSavedServices();

      case "reviews":
        return renderReviews();

      case "security":
        return renderSecurity();

      default:
        return renderOverview();
    }
  };

  return (
    <div className="account-page">
      {/* NAVBAR */}
      <nav className="account-navbar">
        <div className="account-navbar-container">
          <Link to="/home" className="account-logo">
            Pata Kazi
          </Link>

          <div className="account-nav-right">
            <Link to="/home">Home</Link>

            <Link to="/post-task">Post a task</Link>

            <button
              type="button"
              onClick={handleLogout}
              className="account-top-logout"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="account-layout">
        {/* SIDEBAR */}
        <aside className="account-sidebar">
          <div className="account-user-card">
            <div className="account-avatar">
              {savedUser?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="account-user-details">
              <h2>{savedUser?.fullName || "Pata Kazi User"}</h2>

              <p>{savedUser?.email || ""}</p>

              <span>
                {savedUser?.role === "provider"
                  ? "Service Provider"
                  : "Customer"}
              </span>
            </div>
          </div>

          <div className="account-sidebar-divider"></div>

          <nav className="account-menu">
            <button
              type="button"
              className={
                activeSection === "overview"
                  ? "account-menu-item active"
                  : "account-menu-item"
              }
              onClick={() => setActiveSection("overview")}
            >
              <span>Overview</span>
            </button>

            <button
              type="button"
              className={
                activeSection === "tasks"
                  ? "account-menu-item active"
                  : "account-menu-item"
              }
              onClick={() => setActiveSection("tasks")}
            >
              <span>My Tasks</span>

              <span className="menu-count">{totalTasks}</span>
            </button>

            <button
              type="button"
              className={
                activeSection === "saved"
                  ? "account-menu-item active"
                  : "account-menu-item"
              }
              onClick={() => setActiveSection("saved")}
            >
              <span>Saved Services</span>
            </button>

            <button
              type="button"
              className={
                activeSection === "reviews"
                  ? "account-menu-item active"
                  : "account-menu-item"
              }
              onClick={() => setActiveSection("reviews")}
            >
              <span>Reviews</span>
            </button>

            <button
              type="button"
              className={
                activeSection === "security"
                  ? "account-menu-item active"
                  : "account-menu-item"
              }
              onClick={() => setActiveSection("security")}
            >
              <span>Security</span>
            </button>
          </nav>
        </aside>

        {/* CONTENT */}
        <section className="account-main-content">
          {renderActiveSection()}
        </section>
      </main>
    </div>
  );
}

export default Account;
