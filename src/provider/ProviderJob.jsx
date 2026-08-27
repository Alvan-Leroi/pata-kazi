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

  const [existingOffer, setExistingOffer] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [submittingOffer, setSubmittingOffer] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const [offerForm, setOfferForm] = useState({
    amount: "",
    message: "",
  });

  /*
  ========================================
  HELPER - SAFELY READ API RESPONSE
  ========================================
  */

  const readResponse = async (response) => {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        message: text,
      };
    }
  };

  /*
  ========================================
  LOAD JOB + EXISTING OFFER
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

    if (!API_URL) {
      setMessage("The API address is not configured.");

      setMessageType("error");

      setIsLoading(false);

      return;
    }

    const loadPage = async () => {
      try {
        setIsLoading(true);

        setMessage("");

        /*
          LOAD JOB
          */

        const jobResponse = await fetch(`${API_URL}/api/tasks/${jobId}`, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const jobData = await readResponse(jobResponse);

        if (!jobResponse.ok) {
          setMessage(
            jobData.message ||
              `Unable to load job. Server returned ${jobResponse.status}.`,
          );

          setMessageType("error");

          return;
        }

        setJob(jobData);

        setOfferForm((current) => ({
          ...current,

          amount: current.amount || jobData.budget || "",
        }));

        /*
          CHECK FOR EXISTING OFFER
          */

        const offerResponse = await fetch(
          `${API_URL}/api/tasks/${jobId}/my-offer`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const offerData = await readResponse(offerResponse);

        if (offerResponse.ok && offerData.hasOffer) {
          setExistingOffer(offerData.offer);
        } else if (!offerResponse.ok) {
          console.error("Unable to check existing offer:", offerData);
        }
      } catch (error) {
        console.error("Load provider job error:", error);

        setMessage(`Unable to load the job: ${error.message}`);

        setMessageType("error");
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [API_URL, jobId, navigate, savedUser?.role, token]);

  /*
  ========================================
  OFFER FORM CHANGE
  ========================================
  */

  const handleOfferChange = (e) => {
    setOfferForm({
      ...offerForm,

      [e.target.name]: e.target.value,
    });
  };

  /*
  ========================================
  SEND OFFER
  ========================================
  */

  const handleOffer = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    const amount = Number(offerForm.amount);

    if (!offerForm.amount || Number.isNaN(amount) || amount <= 0) {
      setMessage("Please enter a valid price.");

      setMessageType("error");

      return;
    }

    if (!offerForm.message.trim()) {
      setMessage("Please include a short message for the customer.");

      setMessageType("error");

      return;
    }

    if (!token) {
      setMessage("Your session has expired. Please sign in again.");

      setMessageType("error");

      return;
    }

    if (!API_URL) {
      setMessage("The API address is not configured.");

      setMessageType("error");

      return;
    }

    try {
      setSubmittingOffer(true);

      console.log("Sending offer to:", `${API_URL}/api/tasks/${jobId}/offers`);

      console.log("Offer:", {
        amount,
        message: offerForm.message,
      });

      const response = await fetch(`${API_URL}/api/tasks/${jobId}/offers`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          amount,

          message: offerForm.message.trim(),
        }),
      });

      const data = await readResponse(response);

      console.log("Offer API status:", response.status);

      console.log("Offer API response:", data);

      if (!response.ok) {
        setMessage(
          data.message ||
            `Unable to send offer. Server returned ${response.status}.`,
        );

        setMessageType("error");

        if (data.offer) {
          setExistingOffer(data.offer);
        }

        return;
      }

      setExistingOffer(data.offer);

      setMessage(data.message || "Your offer has been sent to the customer.");

      setMessageType("success");
    } catch (error) {
      console.error("Send offer error:", error);

      setMessage(`Offer could not be sent: ${error.message}`);

      setMessageType("error");
    } finally {
      setSubmittingOffer(false);
    }
  };

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

        {message && (
          <div
            className={`provider-job-message ${
              messageType === "success" ? "provider-job-message-success" : ""
            }`}
          >
            {message}
          </div>
        )}

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
            {/* JOB DETAILS */}

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

            {/* OFFER */}

            <aside className="provider-job-sidebar">
              <div className="provider-job-action-card">
                {existingOffer ? (
                  <>
                    <div className="offer-sent-icon">✓</div>

                    <p className="provider-job-action-label">Offer sent</p>

                    <h2>You're interested</h2>

                    <p>Your offer has been sent to the customer.</p>

                    <div className="existing-offer-box">
                      <div>
                        <span>Your price</span>

                        <strong>
                          KES {formatBudget(existingOffer.amount)}
                        </strong>
                      </div>

                      <div>
                        <span>Status</span>

                        <strong className="existing-offer-status">
                          {existingOffer.status}
                        </strong>
                      </div>
                    </div>

                    <div className="existing-offer-message">
                      <span>Your message</span>

                      <p>{existingOffer.message}</p>
                    </div>

                    <p className="provider-job-action-note">
                      The customer can review your offer and decide whether to
                      hire you.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="provider-job-action-label">
                      Interested in this job?
                    </p>

                    <h2>I can do this job</h2>

                    <p>Send the customer your price and a short message.</p>

                    <div className="provider-job-budget-box">
                      <span>Customer budget</span>

                      <strong>KES {formatBudget(job.budget)}</strong>
                    </div>

                    <form
                      onSubmit={handleOffer}
                      className="provider-offer-form"
                    >
                      <div className="provider-offer-field">
                        <label htmlFor="amount">Your price (KES)</label>

                        <input
                          id="amount"
                          name="amount"
                          type="number"
                          min="1"
                          value={offerForm.amount}
                          onChange={handleOfferChange}
                          placeholder="Enter your price"
                          required
                        />
                      </div>

                      <div className="provider-offer-field">
                        <label htmlFor="message">Message to customer</label>

                        <textarea
                          id="message"
                          name="message"
                          rows="5"
                          maxLength="1000"
                          value={offerForm.message}
                          onChange={handleOfferChange}
                          placeholder="Tell the customer why you are a good fit for this job."
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="provider-job-main-button"
                        disabled={submittingOffer}
                      >
                        {submittingOffer ? "Sending offer..." : "Send my offer"}
                      </button>
                    </form>

                    <p className="provider-job-action-note">
                      The customer must accept your offer before you are hired.
                    </p>
                  </>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProviderJob;
