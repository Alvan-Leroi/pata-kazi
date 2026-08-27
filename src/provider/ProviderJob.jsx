import React, { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { io } from "socket.io-client";

import "./ProviderJob.css";

function ProviderJob() {
  const navigate = useNavigate();

  const { jobId } = useParams();

  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("pataKaziToken");

  const savedUser = JSON.parse(localStorage.getItem("pataKaziUser") || "null");

  const [job, setJob] = useState(null);

  const [existingOffer, setExistingOffer] = useState(null);

  const [payment, setPayment] = useState(null);

  const [paymentPhone, setPaymentPhone] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [submittingOffer, setSubmittingOffer] = useState(false);

  const [requestingPayment, setRequestingPayment] = useState(false);

  const [socketConnected, setSocketConnected] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const [offerForm, setOfferForm] = useState({
    amount: "",
    message: "",
  });

  /*
  ========================================
  SAFE API RESPONSE
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
  LOAD PAGE
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
          ========================================
          JOB
          ========================================
          */

        const jobResponse = await fetch(`${API_URL}/api/tasks/${jobId}`, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const jobData = await readResponse(jobResponse);

        if (!jobResponse.ok) {
          setMessage(jobData.message || "Unable to load job.");

          setMessageType("error");

          return;
        }

        setJob(jobData);

        setOfferForm((current) => ({
          ...current,

          amount: current.amount || jobData.budget || "",
        }));

        /*
          ========================================
          OFFER
          ========================================
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
        }

        /*
          ========================================
          PAYMENT
          ========================================
          */

        const paymentResponse = await fetch(
          `${API_URL}/api/payments/task/${jobId}`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const paymentData = await readResponse(paymentResponse);

        if (paymentResponse.ok && paymentData.payment) {
          setPayment(paymentData.payment);

          if (paymentData.payment.phoneNumber) {
            setPaymentPhone(paymentData.payment.phoneNumber);
          }
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
  SOCKET PAYMENT UPDATES
  ========================================
  */

  useEffect(() => {
    if (!API_URL || !token) {
      return;
    }

    const socket = io(API_URL, {
      auth: {
        token,
      },

      transports: ["websocket", "polling"],

      reconnection: true,
    });

    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("connect_error", () => {
      setSocketConnected(false);
    });

    socket.on("payment_request_sent", (update) => {
      if (update.taskId?.toString() !== jobId?.toString()) {
        return;
      }

      setPayment((current) => ({
        ...current,

        ...update,

        status: "pending",
      }));

      if (update.phoneNumber) {
        setPaymentPhone(update.phoneNumber);
      }

      setMessage(
        `Payment request sent to ${update.phoneNumber}. Waiting for M-PESA confirmation.`,
      );

      setMessageType("success");

      setRequestingPayment(false);
    });

    socket.on("payment_updated", (update) => {
      if (update.taskId?.toString() !== jobId?.toString()) {
        return;
      }

      setPayment((current) => ({
        ...current,

        ...update,
      }));

      setRequestingPayment(false);

      if (update.status === "paid") {
        setMessage("Payment confirmed. The M-PESA payment was successful.");

        setMessageType("success");
      }

      if (update.status === "cancelled") {
        setMessage("The M-PESA payment was cancelled.");

        setMessageType("error");
      }

      if (update.status === "failed") {
        setMessage("The M-PESA payment failed. You can try again.");

        setMessageType("error");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [API_URL, jobId, token]);

  /*
  ========================================
  OFFER INPUT
  ========================================
  */

  const handleOfferChange = (event) => {
    setOfferForm({
      ...offerForm,

      [event.target.name]: event.target.value,
    });
  };

  /*
  ========================================
  PHONE INPUT
  ========================================
  */

  const handlePaymentPhoneChange = (event) => {
    const value = event.target.value.replace(/[^\d+]/g, "").slice(0, 13);

    setPaymentPhone(value);
  };

  /*
  ========================================
  SEND OFFER
  ========================================
  */

  const handleOffer = async (event) => {
    event.preventDefault();

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

    try {
      setSubmittingOffer(true);

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

      if (!response.ok) {
        setMessage(data.message || "Unable to send offer.");

        setMessageType("error");

        return;
      }

      setExistingOffer(data.offer);

      setMessage(data.message || "Your offer has been sent.");

      setMessageType("success");
    } catch (error) {
      setMessage(`Offer could not be sent: ${error.message}`);

      setMessageType("error");
    } finally {
      setSubmittingOffer(false);
    }
  };

  /*
  ========================================
  REQUEST PAYMENT
  ========================================
  */

  const handleRequestPayment = async () => {
    if (existingOffer?.status !== "accepted") {
      setMessage("The customer must accept your offer first.");

      setMessageType("error");

      return;
    }

    if (!paymentPhone.trim()) {
      setMessage(
        "Enter the M-PESA number that should receive the payment request.",
      );

      setMessageType("error");

      return;
    }

    const confirmed = window.confirm(
      `Send an M-PESA payment request for KES ${Number(
        existingOffer.amount || 0,
      ).toLocaleString()} to ${paymentPhone}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setRequestingPayment(true);

      setMessage("Sending M-PESA request...");

      setMessageType("");

      const response = await fetch(`${API_URL}/api/payments/mpesa/stk-push`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          taskId: jobId,

          phoneNumber: paymentPhone.trim(),
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        setMessage(data.message || "Unable to request payment.");

        setMessageType("error");

        setRequestingPayment(false);

        return;
      }

      setPayment({
        _id: data.paymentId,

        taskId: jobId,

        amount: data.amount,

        phoneNumber: data.phoneNumber,

        status: "pending",
      });

      setPaymentPhone(data.phoneNumber || paymentPhone);

      setMessage(`M-PESA request sent to ${data.phoneNumber}.`);

      setMessageType("success");
    } catch (error) {
      console.error("Payment request error:", error);

      setMessage("Unable to send payment request.");

      setMessageType("error");
    } finally {
      setRequestingPayment(false);
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
    return Number(budget || 0).toLocaleString("en-KE");
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
  STATES
  ========================================
  */

  const offerAccepted = existingOffer?.status === "accepted";

  const activeJob = ["assigned", "in-progress"].includes(job?.status);

  const paymentPending = payment?.status === "pending";

  const paymentPaid = payment?.status === "paid";

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
          ← Back to dashboard
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

            <Link to="/provider" className="provider-job-main-button">
              Browse jobs
            </Link>
          </div>
        ) : (
          <div className="provider-job-layout">
            {/* =================================
                JOB
            ================================== */}

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
                  <span>{offerAccepted ? "Agreed price" : "Budget"}</span>

                  <strong>
                    KES{" "}
                    {formatBudget(
                      offerAccepted ? existingOffer.amount : job.budget,
                    )}
                  </strong>
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

            {/* =================================
                SIDEBAR
            ================================== */}

            <aside className="provider-job-sidebar">
              <div className="provider-job-action-card">
                {existingOffer ? (
                  <>
                    <div className="offer-sent-icon">✓</div>

                    <p className="provider-job-action-label">Offer</p>

                    <h2>{offerAccepted ? "You were hired" : "Offer sent"}</h2>

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

                    {offerAccepted && activeJob && (
                      <>
                        {paymentPaid ? (
                          <>
                            <div className="existing-offer-box">
                              <div>
                                <span>Payment</span>

                                <strong>✓ Paid</strong>
                              </div>

                              <div>
                                <span>Amount</span>

                                <strong>
                                  KES {formatBudget(payment.amount)}
                                </strong>
                              </div>
                            </div>

                            {payment?.mpesaReceiptNumber && (
                              <div className="existing-offer-message">
                                <span>M-PESA receipt</span>

                                <p>{payment.mpesaReceiptNumber}</p>
                              </div>
                            )}
                          </>
                        ) : paymentPending ? (
                          <>
                            <div className="existing-offer-box">
                              <div>
                                <span>Payment</span>

                                <strong>Waiting</strong>
                              </div>

                              <div>
                                <span>Sent to</span>

                                <strong>{payment.phoneNumber}</strong>
                              </div>
                            </div>

                            <p className="provider-job-action-note">
                              Waiting for the M-PESA payment result.
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="provider-offer-field">
                              <label htmlFor="paymentPhone">
                                M-PESA phone number
                              </label>

                              <input
                                id="paymentPhone"
                                type="tel"
                                value={paymentPhone}
                                onChange={handlePaymentPhoneChange}
                                placeholder="0712345678"
                                autoComplete="tel"
                              />
                            </div>

                            <p className="provider-job-action-note">
                              Enter the number that should receive the M-PESA
                              STK Push.
                            </p>

                            <button
                              type="button"
                              className="provider-job-main-button"
                              onClick={handleRequestPayment}
                              disabled={requestingPayment}
                            >
                              {requestingPayment
                                ? "Sending request..."
                                : `Request Payment — KES ${formatBudget(
                                    existingOffer.amount,
                                  )}`}
                            </button>
                          </>
                        )}

                        <Link
                          to={`/task/${jobId}/chat`}
                          className="provider-job-main-button"
                        >
                          Message Customer
                        </Link>
                      </>
                    )}

                    {!offerAccepted && (
                      <p className="provider-job-action-note">
                        The customer must accept your offer before payment can
                        be requested.
                      </p>
                    )}

                    <p className="provider-job-action-note">
                      {socketConnected
                        ? "Live updates connected."
                        : "Connecting to live updates..."}
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
