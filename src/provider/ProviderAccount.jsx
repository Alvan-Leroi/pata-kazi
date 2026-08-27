import React, { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import "./ProviderAccount.css";

function ProviderAccount() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("pataKaziToken");

  const savedUser = JSON.parse(localStorage.getItem("pataKaziUser") || "null");

  const [activeSection, setActiveSection] = useState("overview");

  const [openJobs, setOpenJobs] = useState([]);

  const [jobsLoading, setJobsLoading] = useState(false);

  const [jobsMessage, setJobsMessage] = useState("");

  const providerServices = savedUser?.services || [];

  const providerFirstName = savedUser?.fullName?.split(" ")[0] || "Provider";

  /*
  ========================================
  PROTECT PROVIDER ACCOUNT
  ========================================
  */

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    if (savedUser?.role !== "provider") {
      navigate("/home");
      return;
    }

    const loadJobs = async () => {
      try {
        setJobsLoading(true);

        setJobsMessage("");

        const response = await fetch(`${API_URL}/api/tasks/open`, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setJobsMessage(data.message || "Unable to load jobs.");

          return;
        }

        setOpenJobs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Provider account job loading error:", error);

        setJobsMessage("Unable to connect to the server.");
      } finally {
        setJobsLoading(false);
      }
    };

    loadJobs();
  }, [API_URL, navigate, savedUser?.role, token]);

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
  FORMATTERS
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
  MATCHED JOB COUNT
  ========================================
  */

  const matchingJobs = openJobs.filter((job) =>
    providerServices.includes(job.category),
  );

  /*
  ========================================
  OVERVIEW
  ========================================
  */

  const renderOverview = () => {
    return (
      <div className="provider-account-section">
        <div className="provider-account-heading">
          <p className="provider-account-label">Provider dashboard</p>

          <h2>Welcome back, {providerFirstName}</h2>

          <p>
            Manage your services, find work, and keep track of your provider
            profile.
          </p>
        </div>

        <div className="provider-account-stats">
          <button
            type="button"
            className="provider-account-stat"
            onClick={() => setActiveSection("jobs")}
          >
            <strong>{openJobs.length}</strong>

            <span>Open Jobs</span>
          </button>

          <button
            type="button"
            className="provider-account-stat"
            onClick={() => setActiveSection("jobs")}
          >
            <strong>{matchingJobs.length}</strong>

            <span>Matching Jobs</span>
          </button>

          <button
            type="button"
            className="provider-account-stat"
            onClick={() => setActiveSection("services")}
          >
            <strong>{providerServices.length}</strong>

            <span>Services</span>
          </button>

          <button
            type="button"
            className="provider-account-stat"
            onClick={() => setActiveSection("reviews")}
          >
            <strong>{savedUser?.rating > 0 ? savedUser.rating : "New"}</strong>

            <span>Rating</span>
          </button>
        </div>

        <div className="provider-account-overview-grid">
          <div className="provider-account-card">
            <div className="provider-account-card-header">
              <div>
                <p className="provider-account-label">Profile</p>

                <h3>Provider Profile</h3>
              </div>

              <button
                type="button"
                className="provider-account-text-button"
                onClick={() => setActiveSection("services")}
              >
                Edit
              </button>
            </div>

            <div className="provider-profile-summary">
              <div className="provider-account-big-avatar">
                {savedUser?.fullName?.charAt(0).toUpperCase() || "P"}
              </div>

              <div>
                <h3>{savedUser?.fullName || "Provider"}</h3>

                <p>{savedUser?.email || ""}</p>

                <span>{savedUser?.location || "Location not added"}</span>
              </div>
            </div>

            <div className="provider-account-profile-row">
              <span>Role</span>

              <strong>Service Provider</strong>
            </div>

            <div className="provider-account-profile-row">
              <span>Phone</span>

              <strong>{savedUser?.phone || "Not available"}</strong>
            </div>

            <div className="provider-account-profile-row">
              <span>Services</span>

              <strong>{providerServices.length}</strong>
            </div>
          </div>

          <div className="provider-account-card">
            <p className="provider-account-label">Quick actions</p>

            <h3>Manage your work</h3>

            <div className="provider-account-quick-actions">
              <Link to="/provider" className="provider-account-primary-action">
                Find available jobs
              </Link>

              <button
                type="button"
                className="provider-account-secondary-action"
                onClick={() => setActiveSection("services")}
              >
                Manage services
              </button>

              <button
                type="button"
                className="provider-account-secondary-action"
                onClick={() => setActiveSection("saved")}
              >
                Saved jobs
              </button>

              <button
                type="button"
                className="provider-account-secondary-action"
                onClick={() => setActiveSection("reviews")}
              >
                Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /*
  ========================================
  SERVICES
  ========================================
  */

  const renderServices = () => {
    return (
      <div className="provider-account-section">
        <div className="provider-account-heading">
          <p className="provider-account-label">Provider profile</p>

          <h2>My Services</h2>

          <p>These are the types of work you currently offer on Pata Kazi.</p>
        </div>

        {providerServices.length === 0 ? (
          <div className="provider-account-empty">
            <div className="provider-account-empty-icon">+</div>

            <h3>No services added yet</h3>

            <p>
              Add your skills and service categories so Pata Kazi can match you
              with relevant customer jobs.
            </p>

            <button type="button" className="provider-account-main-button">
              Add services
            </button>
          </div>
        ) : (
          <div className="provider-account-service-grid">
            {providerServices.map((service) => (
              <div className="provider-account-service-card" key={service}>
                <div className="provider-account-service-letter">
                  {service.charAt(0)}
                </div>

                <div>
                  <h3>{service}</h3>

                  <p>Jobs in this category can be matched with your profile.</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="provider-account-note">
          <strong>Next step</strong>

          <p>
            We can make this section editable next so providers can add and
            remove services directly from MongoDB.
          </p>
        </div>
      </div>
    );
  };

  /*
  ========================================
  JOBS
  ========================================
  */

  const renderJobs = () => {
    return (
      <div className="provider-account-section">
        <div className="provider-account-heading provider-account-heading-row">
          <div>
            <p className="provider-account-label">Marketplace</p>

            <h2>My Jobs</h2>

            <p>
              Browse open jobs and keep track of work you may be interested in.
            </p>
          </div>

          <Link to="/provider" className="provider-account-main-button">
            Browse all jobs
          </Link>
        </div>

        {jobsLoading && (
          <div className="provider-account-empty">Loading jobs...</div>
        )}

        {!jobsLoading && jobsMessage && (
          <div className="provider-account-empty">{jobsMessage}</div>
        )}

        {!jobsLoading && !jobsMessage && openJobs.length === 0 && (
          <div className="provider-account-empty">
            <div className="provider-account-empty-icon">0</div>

            <h3>No open jobs right now</h3>

            <p>
              New customer jobs will appear here when they become available.
            </p>
          </div>
        )}

        {!jobsLoading && !jobsMessage && openJobs.length > 0 && (
          <div className="provider-account-job-grid">
            {openJobs.map((job) => {
              const isMatch = providerServices.includes(job.category);

              return (
                <article className="provider-account-job-card" key={job._id}>
                  <div className="provider-account-job-top">
                    <div>
                      <span className="provider-account-job-status">Open</span>

                      {isMatch && (
                        <span className="provider-account-match-badge">
                          Matches
                        </span>
                      )}
                    </div>

                    <span className="provider-account-job-date">
                      {formatDate(job.createdAt)}
                    </span>
                  </div>

                  <h3>{job.title}</h3>

                  <p className="provider-account-job-description">
                    {job.description}
                  </p>

                  <div className="provider-account-job-meta">
                    <span>{job.category}</span>

                    <span>{job.location}</span>

                    <span>KES {formatBudget(job.budget)}</span>
                  </div>

                  <Link
                    to={`/provider/job/${job._id}`}
                    className="provider-account-job-button"
                  >
                    View job
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /*
  ========================================
  SAVED JOBS
  ========================================
  */

  const renderSaved = () => {
    return (
      <div className="provider-account-section">
        <div className="provider-account-heading">
          <p className="provider-account-label">Favorites</p>

          <h2>Saved Jobs</h2>

          <p>Jobs you save for later will appear here.</p>
        </div>

        <div className="provider-account-empty">
          <div className="provider-account-empty-icon">♡</div>

          <h3>No saved jobs yet</h3>

          <p>
            When you see a job you may want to return to, save it and it will
            appear here.
          </p>

          <Link to="/provider" className="provider-account-main-button">
            Browse jobs
          </Link>
        </div>
      </div>
    );
  };

  /*
  ========================================
  REVIEWS
  ========================================
  */

  const renderReviews = () => {
    return (
      <div className="provider-account-section">
        <div className="provider-account-heading">
          <p className="provider-account-label">Reputation</p>

          <h2>Reviews</h2>

          <p>Customer feedback from completed jobs will appear here.</p>
        </div>

        <div className="provider-account-empty">
          <div className="provider-account-empty-icon">★</div>

          <h3>No reviews yet</h3>

          <p>
            Complete jobs and provide great service to begin building your
            reputation.
          </p>
        </div>
      </div>
    );
  };

  /*
  ========================================
  EARNINGS
  ========================================
  */

  const renderEarnings = () => {
    return (
      <div className="provider-account-section">
        <div className="provider-account-heading">
          <p className="provider-account-label">Income</p>

          <h2>Earnings</h2>

          <p>Track money earned from completed Pata Kazi jobs.</p>
        </div>

        <div className="provider-earnings-grid">
          <div className="provider-earnings-card">
            <span>Total earnings</span>

            <strong>KES 0</strong>

            <p>No completed paid jobs yet.</p>
          </div>

          <div className="provider-earnings-card">
            <span>This month</span>

            <strong>KES 0</strong>

            <p>Monthly earnings will appear here.</p>
          </div>

          <div className="provider-earnings-card">
            <span>Completed jobs</span>

            <strong>0</strong>

            <p>Completed work will be counted here.</p>
          </div>
        </div>
      </div>
    );
  };

  /*
  ========================================
  SECURITY
  ========================================
  */

  const renderSecurity = () => {
    return (
      <div className="provider-account-section">
        <div className="provider-account-heading">
          <p className="provider-account-label">Account protection</p>

          <h2>Security</h2>

          <p>Review your account and sign-in information.</p>
        </div>

        <div className="provider-security-grid">
          <div className="provider-security-card">
            <span className="provider-security-icon">@</span>

            <h3>Email</h3>

            <p>{savedUser?.email || "Not available"}</p>
          </div>

          <div className="provider-security-card">
            <span className="provider-security-icon">●</span>

            <h3>Password</h3>

            <p>••••••••••••</p>
          </div>

          <div className="provider-security-card">
            <span className="provider-security-icon">✓</span>

            <h3>Session</h3>

            <p>Signed in</p>
          </div>

          <div className="provider-security-card">
            <span className="provider-security-icon">↪</span>

            <h3>Sign out</h3>

            <button
              type="button"
              className="provider-security-logout"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    );
  };

  /*
  ========================================
  ACTIVE SECTION
  ========================================
  */

  const renderSection = () => {
    switch (activeSection) {
      case "services":
        return renderServices();

      case "jobs":
        return renderJobs();

      case "saved":
        return renderSaved();

      case "reviews":
        return renderReviews();

      case "earnings":
        return renderEarnings();

      case "security":
        return renderSecurity();

      default:
        return renderOverview();
    }
  };

  return (
    <div className="provider-account-page">
      <nav className="provider-account-navbar">
        <div className="provider-account-navbar-container">
          <Link to="/provider" className="provider-account-logo">
            Pata Kazi
          </Link>

          <div className="provider-account-top-links">
            <Link to="/provider">Find Jobs</Link>

            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="provider-account-layout">
        <aside className="provider-account-sidebar">
          <div className="provider-account-user">
            <div className="provider-account-avatar">
              {savedUser?.fullName?.charAt(0).toUpperCase() || "P"}
            </div>

            <div>
              <h3>{savedUser?.fullName || "Provider"}</h3>

              <p>{savedUser?.email || ""}</p>

              <span>Service Provider</span>
            </div>
          </div>

          <div className="provider-account-divider"></div>

          <nav className="provider-account-menu">
            <button
              type="button"
              className={
                activeSection === "overview"
                  ? "provider-account-menu-item active"
                  : "provider-account-menu-item"
              }
              onClick={() => setActiveSection("overview")}
            >
              Overview
            </button>

            <button
              type="button"
              className={
                activeSection === "services"
                  ? "provider-account-menu-item active"
                  : "provider-account-menu-item"
              }
              onClick={() => setActiveSection("services")}
            >
              <span>My Services</span>

              <span className="provider-account-menu-count">
                {providerServices.length}
              </span>
            </button>

            <button
              type="button"
              className={
                activeSection === "jobs"
                  ? "provider-account-menu-item active"
                  : "provider-account-menu-item"
              }
              onClick={() => setActiveSection("jobs")}
            >
              <span>My Jobs</span>

              <span className="provider-account-menu-count">
                {openJobs.length}
              </span>
            </button>

            <button
              type="button"
              className={
                activeSection === "saved"
                  ? "provider-account-menu-item active"
                  : "provider-account-menu-item"
              }
              onClick={() => setActiveSection("saved")}
            >
              Saved Jobs
            </button>

            <button
              type="button"
              className={
                activeSection === "reviews"
                  ? "provider-account-menu-item active"
                  : "provider-account-menu-item"
              }
              onClick={() => setActiveSection("reviews")}
            >
              Reviews
            </button>

            <button
              type="button"
              className={
                activeSection === "earnings"
                  ? "provider-account-menu-item active"
                  : "provider-account-menu-item"
              }
              onClick={() => setActiveSection("earnings")}
            >
              Earnings
            </button>

            <button
              type="button"
              className={
                activeSection === "security"
                  ? "provider-account-menu-item active"
                  : "provider-account-menu-item"
              }
              onClick={() => setActiveSection("security")}
            >
              Security
            </button>
          </nav>
        </aside>

        <section className="provider-account-content">
          {renderSection()}
        </section>
      </main>
    </div>
  );
}

export default ProviderAccount;
