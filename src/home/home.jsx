import React, { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import "./home.css";

function Home() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("pataKaziToken");

  const savedUser = JSON.parse(localStorage.getItem("pataKaziUser"));

  const isLoggedIn = !!token;

  const [myTasks, setMyTasks] = useState([]);

  const [tasksLoading, setTasksLoading] = useState(false);

  const [tasksMessage, setTasksMessage] = useState("");

  const categories = [
    "Cleaning",
    "Moving",
    "Furniture Assembly",
    "Handyman",
    "Delivery",
    "Yard Work",
  ];

  useEffect(() => {
    if (isLoggedIn && savedUser?.role === "provider") {
      navigate("/provider", {
        replace: true,
      });
    }
  }, [isLoggedIn, navigate, savedUser?.role]);

  useEffect(() => {
    const loadMyTasks = async () => {
      if (!isLoggedIn || !token || !API_URL || savedUser?.role === "provider") {
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
          setTasksMessage(data.message || "Unable to load your posted tasks.");

          return;
        }

        setMyTasks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Load tasks error:", error);

        setTasksMessage("Unable to load your posted tasks.");
      } finally {
        setTasksLoading(false);
      }
    };

    loadMyTasks();
  }, [API_URL, isLoggedIn, savedUser?.role, token]);

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

    return new Date(dateValue).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoggedIn && savedUser?.role === "provider") {
    return null;
  }

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/home" className="logo">
            Pata Kazi
          </Link>

          <div className="nav-links">
            <a href="#services">Services</a>

            <a href="#how-it-works">How it works</a>

            {isLoggedIn && <a href="#my-tasks">My Tasks</a>}

            {isLoggedIn && <Link to="/account">My Account</Link>}

            {!isLoggedIn && <Link to="/signup">Become a Provider</Link>}
          </div>

          <div className="nav-actions">
            {isLoggedIn ? (
              <>
                <Link to="/account" className="user-profile-link">
                  <div className="user-avatar">
                    {savedUser?.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <div className="user-info">
                    <span className="user-name">
                      {savedUser?.fullName || "My Account"}
                    </span>

                    <small className="user-role">Customer</small>
                  </div>
                </Link>

                <button
                  type="button"
                  className="logout-home-button"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="login-link">
                  Sign in
                </Link>

                <Link to="/signup" className="signup-nav-button">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-badge">Local services made simple</span>

            <h1>
              Get help with the things
              <span> you need done.</span>
            </h1>

            <p>
              Connect with trusted local service providers for everyday tasks,
              projects, and jobs.
            </p>

            <div className="hero-actions">
              <Link
                to={isLoggedIn ? "/post-task" : "/signup"}
                className="primary-button"
              >
                Find someone
              </Link>

              <Link to="/signup" className="secondary-button">
                Find work
              </Link>
            </div>
          </div>
        </section>

        {isLoggedIn && (
          <section className="my-tasks-section" id="my-tasks">
            <div className="my-tasks-container">
              <div className="my-tasks-heading">
                <div>
                  <p className="my-tasks-label">Your activity</p>

                  <h2>My Posted Tasks</h2>

                  <p>
                    View your posted jobs, provider offers, and active work.
                  </p>
                </div>

                <Link to="/post-task" className="new-task-button">
                  + Post a new task
                </Link>
              </div>

              {tasksLoading && (
                <div className="tasks-state-card">
                  Loading your posted tasks...
                </div>
              )}

              {!tasksLoading && tasksMessage && (
                <div className="tasks-state-card">{tasksMessage}</div>
              )}

              {!tasksLoading && !tasksMessage && myTasks.length === 0 && (
                <div className="tasks-empty-card">
                  <div className="tasks-empty-icon">+</div>

                  <h3>You have not posted any tasks yet</h3>

                  <p>When you post a job, it will appear here.</p>

                  <Link to="/post-task" className="empty-post-task-button">
                    Post your first task
                  </Link>
                </div>
              )}

              {!tasksLoading && !tasksMessage && myTasks.length > 0 && (
                <div className="my-tasks-grid">
                  {myTasks.map((task) => {
                    const canChat = ["assigned", "in-progress"].includes(
                      task.status,
                    );

                    return (
                      <article className="home-task-card" key={task._id}>
                        <div className="home-task-card-top">
                          <span
                            className={`task-status task-status-${task.status}`}
                          >
                            {task.status || "open"}
                          </span>

                          <span className="task-date">
                            {formatDate(task.createdAt)}
                          </span>
                        </div>

                        <h3>{task.title}</h3>

                        <p className="home-task-description">
                          {task.description}
                        </p>

                        <div className="home-task-meta">
                          <span>{task.category}</span>

                          <span>{task.location}</span>

                          <span>KES {formatBudget(task.budget)}</span>
                        </div>

                        {task.assignedProviderId?.fullName && canChat && (
                          <div className="home-assigned-provider">
                            <span>Assigned provider</span>

                            <strong>{task.assignedProviderId.fullName}</strong>
                          </div>
                        )}

                        <div className="home-task-actions">
                          {task.status === "open" && (
                            <>
                              <Link
                                to={`/task/${task._id}/offers`}
                                className="view-offers-button"
                              >
                                View Offers
                              </Link>

                              <Link
                                to={`/task/${task._id}/providers`}
                                className="view-providers-button"
                              >
                                Find Providers
                              </Link>
                            </>
                          )}

                          {canChat && (
                            <>
                              <Link
                                to={`/task/${task._id}/chat`}
                                className="message-provider-button"
                              >
                                Message Provider
                              </Link>

                              <Link
                                to={`/task/${task._id}/offers`}
                                className="view-offers-button"
                              >
                                View Job Details
                              </Link>
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="services-section" id="services">
          <div className="section-heading">
            <p>Popular services</p>

            <h2>What do you need help with?</h2>

            <span>
              Browse some of the most popular services available on Pata Kazi.
            </span>
          </div>

          <div className="services-grid">
            {categories.map((category) => (
              <div className="service-card" key={category}>
                <div className="service-icon">{category.charAt(0)}</div>

                <h3>{category}</h3>

                <p>Find trusted providers near you.</p>

                <Link
                  to={isLoggedIn ? "/post-task" : "/signup"}
                  className="service-explore-link"
                >
                  Explore
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <p>How it works</p>

            <h2>Getting things done is simple</h2>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <span>01</span>

              <h3>Post your task</h3>

              <p>Tell us what you need done and where you need it.</p>
            </div>

            <div className="step-card">
              <span>02</span>

              <h3>Receive offers</h3>

              <p>Providers can send you their price and a short message.</p>
            </div>

            <div className="step-card">
              <span>03</span>

              <h3>Choose a provider</h3>

              <p>Compare offers and choose the provider that works for you.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div>
            <h3>Pata Kazi</h3>

            <p>Find work. Find help. Get things done.</p>
          </div>

          <p>© 2026 Pata Kazi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
