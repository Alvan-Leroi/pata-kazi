import React, { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import "./ProviderJob.css";

function ProviderJob() {
  const navigate = useNavigate();

  const { jobId } = useParams();

  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("pataKaziToken");

  const savedUser = JSON.parse(localStorage.getItem("pataKaziUser"));

  const [job, setJob] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [message, setMessage] = useState("");

  /*
  ========================================
  LOAD JOB
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

    const loadJob = async () => {
      try {
        setIsLoading(true);
        setMessage("");

        const response = await fetch(`${API_URL}/api/tasks/${jobId}`, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Unable to load this job.");

          return;
        }

        setJob(data);
      } catch (error) {
        console.error("Load job error:", error);

        setMessage("Unable to connect to the server.");
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [API_URL, jobId, navigate, savedUser?.role, token]);

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
      month: "long",
      day: "numeric",
    });
  };

  /*
  ========================================
  TEMPORARY APPLY ACTION
  ========================================
  */

  const handleOffer = () => {
    setMessage(
      "Offer functionality is coming next. For now, this job is available for you to review.",
    );
  };

  /*
  ========================================
  LOADING
  ========================================
  */

  if (isLoading) {
    return (
      <div className="provider-job-page">
        <div className="provider-job-loading">
          <div className="provider-job-spinner"></div>

          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-job-page">
      {/* NAVBAR */}

      <nav className="provider-job-navbar">
        <div className="provider-job-navbar-container">
          <Link to="/provider" className="provider-job-logo">
            Pata Kazi
          </Link>

          <div className="provider-job-nav-right">
            <Link to="/provider">Find Jobs</Link>

            <Link to="/provider-account">Provider Profile</Link>

            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="provider-job-container">
        <Link to="/provider" className="provider-job-back">
          ← Back to available jobs
        </Link>

        {message && <div className="provider-job-message">{message}</div>}

        {!job ? (
          <div className="provider-job-empty">
            <h2>Job not found</h2>

            <p>This job may no longer be available.</p>

            <Link to="/provider" className="provider-job-main-button">
              Browse jobs
            </Link>
          </div>
        ) : (
          <div className="provider-job-layout">
            {/* MAIN JOB CONTENT */}

            <section className="provider-job-main">
              <div className="provider-job-heading">
                <div className="provider-job-heading-top">
                  <span className="provider-job-open-badge">
                    {job.status || "open"}
                  </span>

                  <span className="provider-job-posted-date">
                    Posted {formatDate(job.createdAt)}
                  </span>
                </div>

                <h1>{job.title}</h1>

                <p className="provider-job-location">{job.location}</p>
              </div>

              <div className="provider-job-details-grid">
                <div className="provider-job-detail-card">
                  <span>Service</span>

                  <strong>{job.category}</strong>
                </div>

                <div className="provider-job-detail-card">
                  <span>Budget</span>

                  <strong>KES {formatBudget(job.budget)}</strong>
                </div>

                <div className="provider-job-detail-card">
                  <span>Location</span>

                  <strong>{job.location}</strong>
                </div>
              </div>

              <div className="provider-job-description-section">
                <p className="provider-job-section-label">Job description</p>

                <h2>What the customer needs</h2>

                <p>{job.description}</p>
              </div>

              {job.customerId && (
                <div className="provider-job-customer-section">
                  <p className="provider-job-section-label">Customer</p>

                  <h2>Posted by</h2>

                  <div className="provider-job-customer-card">
                    <div className="provider-job-customer-avatar">
                      {job.customerId?.fullName?.charAt(0).toUpperCase() || "C"}
                    </div>

                    <div>
                      <h3>
                        {job.customerId?.fullName || "Pata Kazi Customer"}
                      </h3>

                      <p>{job.customerId?.location || job.location}</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* SIDE ACTION CARD */}

            <aside className="provider-job-sidebar">
              <div className="provider-job-action-card">
                <p className="provider-job-action-label">
                  Interested in this job?
                </p>

                <h2>Offer to help</h2>

                <p>
                  Let the customer know that you are interested in completing
                  this job.
                </p>

                <div className="provider-job-budget-box">
                  <span>Customer budget</span>

                  <strong>KES {formatBudget(job.budget)}</strong>
                </div>

                <button
                  type="button"
                  className="provider-job-main-button"
                  onClick={handleOffer}
                >
                  I can do this job
                </button>

                <button type="button" className="provider-job-save-button">
                  Save job
                </button>

                <p className="provider-job-action-note">
                  You will not be hired until the customer accepts your offer.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProviderJob;
