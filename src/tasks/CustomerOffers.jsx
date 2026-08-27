import React, { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import "./CustomerOffers.css";

function CustomerOffers() {
  const navigate = useNavigate();

  const { taskId } = useParams();

  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("pataKaziToken");

  const savedUser = JSON.parse(localStorage.getItem("pataKaziUser") || "null");

  const [task, setTask] = useState(null);

  const [offers, setOffers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [acceptingId, setAcceptingId] = useState("");

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

  useEffect(() => {
    const loadOffers = async () => {
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

        const response = await fetch(`${API_URL}/api/tasks/${taskId}/offers`, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await readResponse(response);

        if (!response.ok) {
          setError(data.message || "Unable to load offers.");

          return;
        }

        setTask(data.task || null);

        setOffers(Array.isArray(data.offers) ? data.offers : []);
      } catch (loadError) {
        console.error("Load offers error:", loadError);

        setError("Unable to connect to the server.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOffers();
  }, [API_URL, navigate, savedUser?.role, taskId, token]);

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

      if (!response.ok) {
        setError(data.message || "Unable to accept this offer.");

        return;
      }

      setTask(data.task);

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

      setSuccessMessage(
        "Provider selected successfully. The provider can now request payment from you.",
      );
    } catch (acceptError) {
      console.error("Accept offer error:", acceptError);

      setError("Unable to accept offer.");
    } finally {
      setAcceptingId("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pataKaziToken");

    localStorage.removeItem("pataKaziUser");

    navigate("/");
  };

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString("en-KE");
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

  const acceptedOffer = offers.find((offer) => offer.status === "accepted");

  const acceptedProvider = acceptedOffer?.providerId;

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

  return (
    <div className="customer-offers-page">
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

        {error && <div className="customer-offers-message">{error}</div>}

        {successMessage && (
          <div className="customer-offers-message customer-offers-message-success">
            {successMessage}
          </div>
        )}

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

        {task && acceptedOffer && (
          <section className="accepted-provider-section">
            <p className="customer-offers-label">Selected provider</p>

            <h2>Provider confirmed</h2>

            <div className="accepted-provider-card">
              <div className="customer-provider-avatar">
                {acceptedProvider?.fullName?.charAt(0).toUpperCase() || "P"}
              </div>

              <div className="accepted-provider-info">
                <h3>{acceptedProvider?.fullName || "Service Provider"}</h3>

                <p>{acceptedProvider?.location || "Location not added"}</p>
              </div>

              <div className="accepted-provider-price">
                <span>Agreed price</span>

                <strong>KES {formatMoney(acceptedOffer.amount)}</strong>
              </div>
            </div>

            <div className="customer-payment-awaiting">
              <strong>Waiting for payment request</strong>

              <p>
                Your provider will send an M-PESA payment request when payment
                is ready. The prompt will appear on your phone.
              </p>
            </div>

            <Link
              to={`/task/${taskId}/chat`}
              className="customer-message-provider-link"
            >
              Message Provider
            </Link>
          </section>
        )}

        {task && (
          <section className="customer-offers-section">
            <div className="customer-offers-heading">
              <div>
                <p className="customer-offers-label">Provider responses</p>

                <h2>
                  {offers.length} {offers.length === 1 ? "offer" : "offers"}{" "}
                  received
                </h2>

                <p>Compare provider offers and choose who you want to hire.</p>
              </div>
            </div>

            {offers.length === 0 ? (
              <div className="customer-offers-empty">
                <h3>No offers yet</h3>

                <p>Provider offers will appear here.</p>
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
                          <span>Sent</span>

                          <strong>{formatDate(offer.createdAt)}</strong>
                        </div>
                      </div>

                      <div className="customer-offer-message-box">
                        <span>Message from provider</span>

                        <p>{offer.message}</p>
                      </div>

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
