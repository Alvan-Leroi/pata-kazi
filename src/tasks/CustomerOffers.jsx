import React, { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import "./CustomerOffers.css";

function CustomerOffers() {
  const navigate = useNavigate();

  const { taskId } = useParams();

  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("pataKaziToken");

  const savedUser = JSON.parse(localStorage.getItem("pataKaziUser"));

  const [task, setTask] = useState(null);

  const [offers, setOffers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [acceptingId, setAcceptingId] = useState("");

  /*
  ========================================
  SAFE JSON RESPONSE
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
  LOAD OFFERS
  ========================================
  */

  useEffect(() => {
    const loadOffers = async () => {
      /*
      ------------------------------------
      AUTH CHECK
      ------------------------------------
      */

      if (!token) {
        navigate("/");
        return;
      }

      if (savedUser?.role !== "customer") {
        navigate("/provider");
        return;
      }

      if (!API_URL) {
        setError("The API address is not configured.");

        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);
        setError("");

        console.log("Loading offers for task:", taskId);

        console.log("Offers URL:", `${API_URL}/api/tasks/${taskId}/offers`);

        const response = await fetch(`${API_URL}/api/tasks/${taskId}/offers`, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await readResponse(response);

        console.log("Offers response status:", response.status);

        console.log("Offers response:", data);

        if (!response.ok) {
          setError(
            data.message ||
              `Unable to load offers. Server returned ${response.status}.`,
          );

          return;
        }

        setTask(data.task || null);

        setOffers(Array.isArray(data.offers) ? data.offers : []);
      } catch (error) {
        console.error("Load offers error:", error);

        setError(`Unable to connect to the server: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadOffers();
  }, [API_URL, navigate, savedUser?.role, taskId, token]);

  /*
  ========================================
  ACCEPT OFFER
  ========================================
  */

  const handleAcceptOffer = async (offerId) => {
    const confirmed = window.confirm(
      "Are you sure you want to choose this provider?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setAcceptingId(offerId);

      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/api/tasks/${taskId}/offers/${offerId}/accept`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await readResponse(response);

      console.log("Accept offer response:", data);

      if (!response.ok) {
        setError(data.message || "Unable to accept this offer.");

        return;
      }

      /*
        ----------------------------------
        UPDATE TASK
        ----------------------------------
        */

      setTask(data.task);

      /*
        ----------------------------------
        UPDATE OFFERS
        ----------------------------------
        */

      setOffers((currentOffers) =>
        currentOffers.map((offer) => {
          if (offer._id === offerId) {
            return {
              ...offer,
              status: "accepted",
            };
          }

          if (offer.status === "pending") {
            return {
              ...offer,
              status: "declined",
            };
          }

          return offer;
        }),
      );

      setSuccessMessage("Provider selected successfully.");
    } catch (error) {
      console.error("Accept offer error:", error);

      setError(`Unable to accept offer: ${error.message}`);
    } finally {
      setAcceptingId("");
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

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString();
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
  LOADING
  ========================================
  */

  if (isLoading) {
    return (
      <div className="customer-offers-page">
        <div className="customer-offers-loading">
          <div className="customer-offers-spinner"></div>

          <p>Loading offers...</p>
        </div>
      </div>
    );
  }

  /*
  ========================================
  PAGE
  ========================================
  */

  return (
    <div className="customer-offers-page">
      {/* NAVBAR */}

      <nav className="customer-offers-navbar">
        <div className="customer-offers-navbar-container">
          <Link to="/home" className="customer-offers-logo">
            Pata Kazi
          </Link>

          <div className="customer-offers-nav-right">
            <Link to="/home">Home</Link>

            <Link to="/account">My Account</Link>

            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="customer-offers-container">
        <Link to="/home" className="customer-offers-back">
          ← Back to my tasks
        </Link>

        {/* ERROR */}

        {error && <div className="customer-offers-message">{error}</div>}

        {/* SUCCESS */}

        {successMessage && (
          <div className="customer-offers-message customer-offers-message-success">
            {successMessage}
          </div>
        )}

        {/* TASK */}

        {task && (
          <section className="customer-offers-task">
            <div>
              <span
                className={`customer-task-status customer-task-status-${task.status}`}
              >
                {task.status || "open"}
              </span>

              <h1>{task.title}</h1>

              <p>{task.description}</p>
            </div>

            <div className="customer-task-meta">
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

                <strong>KES {formatMoney(task.budget)}</strong>
              </div>
            </div>
          </section>
        )}

        {/* IF TASK COULD NOT LOAD */}

        {!task && !error && (
          <div className="customer-offers-empty">
            <h3>Task could not be loaded</h3>

            <p>Please return to your account and try again.</p>
          </div>
        )}

        {/* OFFERS */}

        {task && (
          <section className="customer-offers-section">
            <div className="customer-offers-heading">
              <div>
                <p className="customer-offers-label">Provider responses</p>

                <h2>
                  {offers.length} {offers.length === 1 ? "offer" : "offers"}{" "}
                  received
                </h2>

                <p>
                  Compare prices and messages from providers interested in your
                  job.
                </p>
              </div>
            </div>

            {/* NO OFFERS */}

            {offers.length === 0 ? (
              <div className="customer-offers-empty">
                <div className="customer-offers-empty-icon">0</div>

                <h3>No offers yet</h3>

                <p>
                  When a provider clicks "I can do this job", their offer will
                  appear here.
                </p>

                <Link to="/home" className="customer-offers-primary-button">
                  Back home
                </Link>
              </div>
            ) : (
              <div className="customer-offers-grid">
                {offers.map((offer) => {
                  const provider = offer.providerId;

                  return (
                    <article
                      className={`customer-offer-card ${
                        offer.status === "accepted"
                          ? "customer-offer-card-accepted"
                          : ""
                      }`}
                      key={offer._id}
                    >
                      {/* PROVIDER */}

                      <div className="customer-offer-top">
                        <div className="customer-provider-header">
                          <div className="customer-provider-avatar">
                            {provider?.fullName?.charAt(0).toUpperCase() || "P"}
                          </div>

                          <div>
                            <h3>{provider?.fullName || "Service Provider"}</h3>

                            <p>{provider?.location || "Location not added"}</p>
                          </div>
                        </div>

                        <span
                          className={`customer-offer-status offer-status-${offer.status}`}
                        >
                          {offer.status}
                        </span>
                      </div>

                      {/* DETAILS */}

                      <div className="customer-offer-details">
                        <div>
                          <span>Price</span>

                          <strong>KES {formatMoney(offer.amount)}</strong>
                        </div>

                        <div>
                          <span>Rating</span>

                          <strong>
                            {provider?.rating > 0 ? provider.rating : "New"}
                          </strong>
                        </div>

                        <div>
                          <span>Offer sent</span>

                          <strong>{formatDate(offer.createdAt)}</strong>
                        </div>
                      </div>

                      {/* SERVICES */}

                      {provider?.services?.length > 0 && (
                        <div className="customer-provider-services">
                          {provider.services.map((service) => (
                            <span key={service}>{service}</span>
                          ))}
                        </div>
                      )}

                      {/* PROVIDER MESSAGE */}

                      <div className="customer-offer-message-box">
                        <span>Message from provider</span>

                        <p>{offer.message}</p>
                      </div>

                      {/* ACTION */}

                      <div className="customer-offer-actions">
                        {offer.status === "accepted" ? (
                          <div className="customer-offer-selected">
                            ✓ Provider selected
                          </div>
                        ) : offer.status === "declined" ? (
                          <div className="customer-offer-declined">
                            Another provider was selected
                          </div>
                        ) : task.status === "open" ? (
                          <button
                            type="button"
                            className="customer-accept-offer-button"
                            disabled={acceptingId === offer._id}
                            onClick={() => handleAcceptOffer(offer._id)}
                          >
                            {acceptingId === offer._id
                              ? "Selecting..."
                              : "Accept offer"}
                          </button>
                        ) : (
                          <div className="customer-offer-declined">
                            Task already assigned
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default CustomerOffers;
