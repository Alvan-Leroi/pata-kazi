import React, { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import "./MatchingProviders.css";

function MatchingProviders() {
  const { taskId } = useParams();

  const API_URL = import.meta.env.VITE_API_URL;

  const [providers, setProviders] = useState([]);

  const [task, setTask] = useState(null);

  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProviders = async () => {
      const token = localStorage.getItem("pataKaziToken");

      if (!token) {
        setMessage("Please sign in to view matching providers.");

        setIsLoading(false);

        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/tasks/${taskId}/providers`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        console.log("MATCHING PROVIDERS:", data);

        if (!response.ok) {
          setMessage(data.message || "Unable to find providers.");

          return;
        }

        setTask(data.task);

        setProviders(data.providers || []);
      } catch (error) {
        console.error("Provider search error:", error);

        setMessage("Unable to connect to the server.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProviders();
  }, [API_URL, taskId]);

  if (isLoading) {
    return (
      <div className="providers-page">
        <div className="providers-loading">
          <div className="loading-circle"></div>

          <p>Finding people who can help...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="providers-page">
      <nav className="providers-navbar">
        <div className="providers-nav-container">
          <Link to="/home" className="providers-logo">
            Pata Kazi
          </Link>

          <div className="providers-nav-links">
            <Link to="/home">Home</Link>

            <Link to="/account">My Account</Link>
          </div>
        </div>
      </nav>

      <main className="providers-container">
        {message && <div className="providers-message">{message}</div>}

        {task && (
          <section className="task-summary">
            <p className="section-label">Your task</p>

            <h1>{task.title}</h1>

            <div className="task-summary-details">
              <span>{task.category}</span>

              <span>{task.location}</span>

              <span>KES {Number(task.budget).toLocaleString()}</span>
            </div>

            <p className="task-description">{task.description}</p>
          </section>
        )}

        <section className="matching-section">
          <div className="matching-header">
            <p className="section-label">Matching providers</p>

            <h2>
              {providers.length}{" "}
              {providers.length === 1 ? "person can" : "people can"} help with
              this task
            </h2>

            <p>Review providers who match the service you need.</p>
          </div>

          {providers.length === 0 ? (
            <div className="no-providers">
              <div className="no-provider-icon">0</div>

              <h3>No matching providers yet</h3>

              <p>
                We couldn't find a provider matching this service and location
                yet.
              </p>

              <div className="no-provider-actions">
                <Link to="/post-task" className="edit-task-button">
                  Post another task
                </Link>

                <Link to="/home" className="back-home-button">
                  Back home
                </Link>
              </div>
            </div>
          ) : (
            <div className="providers-grid">
              {providers.map((provider) => (
                <article className="provider-card" key={provider._id}>
                  <div className="provider-card-top">
                    <div className="provider-avatar">
                      {provider.fullName?.charAt(0).toUpperCase() || "P"}
                    </div>

                    <div className="provider-main-info">
                      <h3>{provider.fullName}</h3>

                      <p>{provider.location || "Location not provided"}</p>
                    </div>

                    <div className="provider-rating">
                      <strong>
                        {provider.rating > 0 ? provider.rating : "New"}
                      </strong>

                      <span>Rating</span>
                    </div>
                  </div>

                  <div className="provider-divider"></div>

                  <div className="provider-services">
                    <p>Services</p>

                    <div className="provider-service-tags">
                      {provider.services && provider.services.length > 0 ? (
                        provider.services.map((service) => (
                          <span key={service}>{service}</span>
                        ))
                      ) : (
                        <span>General services</span>
                      )}
                    </div>
                  </div>

                  <div className="provider-actions">
                    <button type="button" className="provider-profile-button">
                      View profile
                    </button>

                    <button type="button" className="choose-provider-button">
                      Choose provider
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MatchingProviders;
