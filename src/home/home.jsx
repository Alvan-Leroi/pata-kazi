import React, { useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import "./home.css";

function Home() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("pataKaziToken");

  const savedUser = JSON.parse(localStorage.getItem("pataKaziUser") || "null");

  const isLoggedIn = !!token;

  const [myTasks, setMyTasks] = useState([]);

  const [tasksLoading, setTasksLoading] = useState(false);

  const [tasksMessage, setTasksMessage] = useState("");

  const observerRef = useRef(null);

  const categories = [
    "Cleaning",
    "Moving",
    "Furniture Assembly",
    "Handyman",
    "Delivery",
    "Yard Work",
  ];

  /*
  ========================================
  REDIRECT PROVIDERS
  ========================================
  */

  useEffect(() => {
    if (isLoggedIn && savedUser?.role === "provider") {
      navigate("/provider", {
        replace: true,
      });
    }
  }, [isLoggedIn, navigate, savedUser?.role]);

  /*
  ========================================
  LOAD CUSTOMER TASKS
  ========================================
  */

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

  /*
  ========================================
  SCROLL REVEAL ANIMATIONS
  ========================================
  */

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const animatedElements = document.querySelectorAll(
      ".customer-scroll-reveal",
    );

    if (prefersReducedMotion) {
      animatedElements.forEach((element) => {
        element.classList.add("customer-reveal-visible");
      });

      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("customer-reveal-visible");

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,

        rootMargin: "0px 0px -60px 0px",
      },
    );

    animatedElements.forEach((element) => {
      observerRef.current.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [myTasks, tasksLoading]);

  /*
  ========================================
  LOGOUT
  ========================================
  */

  const handleLogout = () => {
    localStorage.removeItem("pataKaziToken");

    localStorage.removeItem("pataKaziUser");

    navigate("/");
  };

  /*
  ========================================
  FORMATTING
  ========================================
  */

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

  /*
  ========================================
  DO NOT SHOW CUSTOMER HOME
  TO PROVIDER
  ========================================
  */

  if (isLoggedIn && savedUser?.role === "provider") {
    return null;
  }

  return (
    <div className="home-page">
      {/* =====================================
          NAVBAR
      ====================================== */}

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
        {/* =====================================
            HERO
        ====================================== */}

        <section className="hero-section">
          <div className="hero-overlay"></div>

          <div className="hero-content">
            <span className="hero-badge hero-entry hero-entry-one">
              Local services made simple
            </span>

            <h1 className="hero-entry hero-entry-two">
              Get help with the things
              <span> you need done.</span>
            </h1>

            <p className="hero-entry hero-entry-three">
              Connect with trusted local service providers for everyday tasks,
              projects, and jobs.
            </p>

            <div className="hero-actions hero-entry hero-entry-four">
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

            <div className="search-box hero-entry hero-entry-five">
              <input type="text" placeholder="What service do you need?" />

              <input type="text" placeholder="Enter your location" />

              <button type="button">Search</button>
            </div>
          </div>
        </section>

        {/* =====================================
            MY TASKS
        ====================================== */}

        {isLoggedIn && (
          <section className="my-tasks-section" id="my-tasks">
            <div className="my-tasks-container">
              <div className="my-tasks-heading customer-scroll-reveal reveal-from-left">
                <div>
                  <p className="my-tasks-label">Your activity</p>

                  <h2>My Posted Tasks</h2>

                  <p>
                    Manage your jobs, review provider offers, and communicate
                    with providers you hire.
                  </p>
                </div>

                <Link to="/post-task" className="new-task-button">
                  + Post a new task
                </Link>
              </div>

              {tasksLoading && (
                <div className="tasks-state-card customer-scroll-reveal">
                  Loading your posted tasks...
                </div>
              )}

              {!tasksLoading && tasksMessage && (
                <div className="tasks-state-card customer-scroll-reveal">
                  {tasksMessage}
                </div>
              )}

              {!tasksLoading && !tasksMessage && myTasks.length === 0 && (
                <div className="tasks-empty-card customer-scroll-reveal reveal-scale">
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
                  {myTasks.map((task, index) => {
                    const canChat = ["assigned", "in-progress"].includes(
                      task.status,
                    );

                    return (
                      <article
                        className="home-task-card customer-scroll-reveal reveal-card"
                        key={task._id}
                        style={{
                          "--reveal-delay": `${(index % 4) * 90}ms`,
                        }}
                      >
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
                          <div>
                            <span>Service</span>

                            <strong>{task.category}</strong>
                          </div>

                          <div>
                            <span>Location</span>

                            <strong>{task.location}</strong>
                          </div>

                          <div>
                            <span>Budget</span>

                            <strong>KES {formatBudget(task.budget)}</strong>
                          </div>
                        </div>

                        {canChat && task.assignedProviderId?.fullName && (
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

                          {task.status === "completed" && (
                            <div className="completed-task-label">
                              Job completed
                            </div>
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

        {/* =====================================
            SERVICES
        ====================================== */}

        <section className="services-section" id="services">
          <div className="section-heading customer-scroll-reveal reveal-from-left">
            <p>Popular services</p>

            <h2>What do you need help with?</h2>

            <span>
              Browse some of the most popular services available on Pata Kazi.
            </span>
          </div>

          <div className="services-grid">
            {categories.map((category, index) => (
              <article
                className="service-card customer-scroll-reveal reveal-card"
                key={category}
                style={{
                  "--reveal-delay": `${index * 90}ms`,
                }}
              >
                <div className="service-icon">{category.charAt(0)}</div>

                <h3>{category}</h3>

                <p>Find trusted providers near you for this service.</p>

                <Link
                  to={isLoggedIn ? "/post-task" : "/signup"}
                  className="service-explore-link"
                >
                  Explore
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* =====================================
            HOW IT WORKS
        ====================================== */}

        <section className="how-section" id="how-it-works">
          <div className="section-heading customer-scroll-reveal reveal-from-right">
            <p>How it works</p>

            <h2>Getting things done is simple</h2>

            <span>
              Post what you need, compare offers, and choose the provider who
              works best for you.
            </span>
          </div>

          <div className="steps-grid">
            <article
              className="step-card customer-scroll-reveal reveal-card"
              style={{
                "--reveal-delay": "0ms",
              }}
            >
              <span>01</span>

              <h3>Post your task</h3>

              <p>
                Tell us what you need done, where you need it, and your budget.
              </p>
            </article>

            <article
              className="step-card customer-scroll-reveal reveal-card"
              style={{
                "--reveal-delay": "130ms",
              }}
            >
              <span>02</span>

              <h3>Receive offers</h3>

              <p>Local providers send you their prices and messages.</p>
            </article>

            <article
              className="step-card customer-scroll-reveal reveal-card"
              style={{
                "--reveal-delay": "260ms",
              }}
            >
              <span>03</span>

              <h3>Choose a provider</h3>

              <p>
                Select a provider, communicate, and get your task completed.
              </p>
            </article>
          </div>
        </section>

        {/* =====================================
            FINAL CTA
        ====================================== */}

        <section className="customer-final-cta">
          <div className="customer-final-cta-inner customer-scroll-reveal reveal-scale">
            <p className="customer-final-small">Ready when you are</p>

            <h2>Have something that needs to get done?</h2>

            <p>
              Post your task and connect with local providers who are ready to
              help.
            </p>

            <Link
              to={isLoggedIn ? "/post-task" : "/signup"}
              className="customer-final-button"
            >
              Post a task
            </Link>
          </div>
        </section>
      </main>

      {/* =====================================
          FOOTER
      ====================================== */}

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
