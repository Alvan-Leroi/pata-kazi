import React, { useEffect, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import "./ProviderHome.css";

function ProviderHome() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("pataKaziToken");

  const savedUser = JSON.parse(localStorage.getItem("pataKaziUser"));

  const [jobs, setJobs] = useState([]);

  const [jobsLoading, setJobsLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [locationFilter, setLocationFilter] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("");

  const isLoggedIn = !!token;

  const providerServices = savedUser?.services || [];

  const providerFirstName = savedUser?.fullName?.split(" ")[0] || "Provider";

  /*
  ========================================
  PROTECT PROVIDER PAGE
  ========================================
  */

  useEffect(() => {
    if (!isLoggedIn) {
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
        setMessage("");

        const response = await fetch(`${API_URL}/api/tasks/open`, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Unable to load available jobs.");

          return;
        }

        setJobs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Load provider jobs error:", error);

        setMessage("Unable to connect to the server.");
      } finally {
        setJobsLoading(false);
      }
    };

    loadJobs();
  }, [API_URL, isLoggedIn, navigate, savedUser?.role, token]);

  /*
  ========================================
  FILTER JOBS
  ========================================
  */

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchMatches =
        !searchTerm ||
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const locationMatches =
        !locationFilter ||
        job.location?.toLowerCase().includes(locationFilter.toLowerCase());

      const categoryMatches =
        !categoryFilter || job.category === categoryFilter;

      return searchMatches && locationMatches && categoryMatches;
    });
  }, [jobs, searchTerm, locationFilter, categoryFilter]);

  /*
  ========================================
  MATCHED JOB COUNT
  ========================================
  */

  const matchedJobs = jobs.filter((job) =>
    providerServices.includes(job.category),
  );

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

  const categories = [
    "Cleaning",
    "Moving",
    "Furniture Assembly",
    "Handyman",
    "Delivery",
    "Yard Work",
  ];

  return (
    <div className="provider-home-page">
      {/* =================================
          NAVBAR
      ================================= */}

      <nav className="provider-navbar">
        <div className="provider-navbar-container">
          <Link to="/provider" className="provider-logo">
            Pata Kazi
          </Link>

          <div className="provider-nav-links">
            <a href="#jobs">Find Jobs</a>

            <a href="#services">My Services</a>

            <Link to="/provider-account">My Work</Link>

            <Link to="/provider-account">Reviews</Link>
          </div>

          <div className="provider-user-area">
            <Link to="/provider-account" className="provider-profile-chip">
              <div className="provider-profile-avatar">
                {savedUser?.fullName?.charAt(0).toUpperCase() || "P"}
              </div>

              <div className="provider-profile-info">
                <span className="provider-profile-name">
                  {savedUser?.fullName || "Provider"}
                </span>

                <small>Service Provider</small>
              </div>
            </Link>

            <button
              type="button"
              className="provider-logout-button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* =================================
            HERO
        ================================= */}

        <section className="provider-dashboard-hero">
          <div className="provider-dashboard-container">
            <div className="provider-welcome-block">
              <span className="provider-dashboard-badge">
                Provider Dashboard
              </span>

              <h1>Welcome back, {providerFirstName}.</h1>

              <p>
                Find jobs that match your skills, manage your services, and grow
                your reputation on Pata Kazi.
              </p>

              <div className="provider-dashboard-actions">
                <a href="#jobs" className="provider-main-action">
                  Find available jobs
                </a>

                <Link
                  to="/provider-account"
                  className="provider-outline-action"
                >
                  Manage profile
                </Link>
              </div>
            </div>

            <div className="provider-profile-summary-card">
              <div className="provider-summary-avatar">
                {savedUser?.fullName?.charAt(0).toUpperCase() || "P"}
              </div>

              <div className="provider-summary-text">
                <p>Your provider profile</p>

                <h3>{savedUser?.fullName || "Provider"}</h3>

                <span>{savedUser?.location || "Location not added"}</span>
              </div>

              <Link
                to="/provider-account"
                className="provider-profile-edit-link"
              >
                Edit profile
              </Link>
            </div>
          </div>
        </section>

        {/* =================================
            DASHBOARD STATS
        ================================= */}

        <section className="provider-stats-section">
          <div className="provider-content-container">
            <div className="provider-stats-grid">
              <div className="provider-stat-card">
                <p>Open Jobs</p>

                <strong>{jobs.length}</strong>

                <span>Available right now</span>
              </div>

              <div className="provider-stat-card">
                <p>Matching Jobs</p>

                <strong>{matchedJobs.length}</strong>

                <span>Match your services</span>
              </div>

              <div className="provider-stat-card">
                <p>Services</p>

                <strong>{providerServices.length}</strong>

                <span>Listed on your profile</span>
              </div>

              <div className="provider-stat-card">
                <p>Rating</p>

                <strong>
                  {savedUser?.rating > 0 ? savedUser.rating : "New"}
                </strong>

                <span>Provider reputation</span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================
            SERVICES
        ================================= */}

        <section className="provider-services-section" id="services">
          <div className="provider-content-container">
            <div className="provider-section-header">
              <div>
                <p className="provider-section-label">Your profile</p>

                <h2>Services you offer</h2>

                <p>
                  These services help Pata Kazi match you with relevant customer
                  jobs.
                </p>
              </div>

              <Link to="/provider-account" className="provider-small-button">
                Edit services
              </Link>
            </div>

            {providerServices.length === 0 ? (
              <div className="provider-empty-services">
                <div className="provider-empty-circle">+</div>

                <div>
                  <h3>Add your services</h3>

                  <p>
                    Your account does not have any services listed yet. Add the
                    types of work you can do so customers can find you.
                  </p>

                  <Link to="/provider-account" className="provider-main-action">
                    Complete provider profile
                  </Link>
                </div>
              </div>
            ) : (
              <div className="provider-service-list">
                {providerServices.map((service) => (
                  <div className="provider-service-card" key={service}>
                    <div className="provider-service-letter">
                      {service.charAt(0)}
                    </div>

                    <div>
                      <h3>{service}</h3>

                      <p>You can receive jobs in this category.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =================================
            JOBS
        ================================= */}

        <section className="provider-jobs-section" id="jobs">
          <div className="provider-content-container">
            <div className="provider-section-header">
              <div>
                <p className="provider-section-label">Marketplace</p>

                <h2>Available Jobs</h2>

                <p>
                  Browse jobs posted by customers and find work that fits your
                  skills.
                </p>
              </div>
            </div>

            {/* FILTERS */}

            <div className="provider-job-filters">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <input
                type="text"
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All services</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {jobsLoading && (
              <div className="provider-state-card">
                Loading available jobs...
              </div>
            )}

            {!jobsLoading && message && (
              <div className="provider-state-card">{message}</div>
            )}

            {!jobsLoading && !message && filteredJobs.length === 0 && (
              <div className="provider-empty-jobs">
                <div className="provider-empty-circle">0</div>

                <h3>No jobs found</h3>

                <p>There are currently no open jobs matching your search.</p>
              </div>
            )}

            {!jobsLoading && !message && filteredJobs.length > 0 && (
              <div className="provider-jobs-grid">
                {filteredJobs.map((job) => {
                  const isMatch = providerServices.includes(job.category);

                  return (
                    <article className="provider-job-card" key={job._id}>
                      <div className="provider-job-card-top">
                        <div>
                          <span className="provider-job-status">Open</span>

                          {isMatch && (
                            <span className="provider-match-badge">
                              Matches your services
                            </span>
                          )}
                        </div>

                        <span className="provider-job-date">
                          {formatDate(job.createdAt)}
                        </span>
                      </div>

                      <h3>{job.title}</h3>

                      <p className="provider-job-description">
                        {job.description}
                      </p>

                      <div className="provider-job-meta">
                        <div>
                          <span>Service</span>

                          <strong>{job.category}</strong>
                        </div>

                        <div>
                          <span>Location</span>

                          <strong>{job.location}</strong>
                        </div>

                        <div>
                          <span>Budget</span>

                          <strong>KES {formatBudget(job.budget)}</strong>
                        </div>
                      </div>

                      {job.customerId?.fullName && (
                        <div className="provider-job-customer">
                          <span>Posted by</span>

                          <strong>{job.customerId.fullName}</strong>
                        </div>
                      )}

                      <div className="provider-job-actions">
                        <Link
                          to={`/provider/job/${job._id}`}
                          className="provider-view-job-button"
                        >
                          View job
                        </Link>

                        <button
                          type="button"
                          className="provider-save-job-button"
                        >
                          Save
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* =================================
            PROVIDER TOOLS
        ================================= */}

        <section className="provider-tools-section">
          <div className="provider-content-container">
            <div className="provider-section-header">
              <div>
                <p className="provider-section-label">Provider tools</p>

                <h2>Manage your work</h2>
              </div>
            </div>

            <div className="provider-tools-grid">
              <Link to="/provider-account" className="provider-tool-card">
                <span>Profile</span>

                <h3>Provider Profile</h3>

                <p>
                  Update your contact details, services, location, and provider
                  information.
                </p>
              </Link>

              <Link to="/provider-account" className="provider-tool-card">
                <span>Work</span>

                <h3>My Jobs</h3>

                <p>
                  Keep track of jobs you are interested in, active work, and
                  completed work.
                </p>
              </Link>

              <Link to="/provider-account" className="provider-tool-card">
                <span>Reputation</span>

                <h3>Reviews</h3>

                <p>
                  See customer feedback and build trust with future customers.
                </p>
              </Link>

              <Link to="/provider-account" className="provider-tool-card">
                <span>Earnings</span>

                <h3>Earnings</h3>

                <p>
                  Track your completed work and earnings once payments are
                  added.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =================================
          FOOTER
      ================================= */}

      <footer className="provider-footer">
        <div className="provider-footer-container">
          <div>
            <h3>Pata Kazi</h3>

            <p>Find work. Build trust. Grow your income.</p>
          </div>

          <p>© 2026 Pata Kazi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default ProviderHome;
