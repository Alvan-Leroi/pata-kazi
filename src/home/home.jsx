import React from "react";
import { Link } from "react-router-dom";
import "./home.css";

function Home() {
  const categories = [
    "Cleaning",
    "Moving",
    "Furniture Assembly",
    "Handyman",
    "Delivery",
    "Yard Work",
  ];

  return (
    <div className="home-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/home" className="logo">
            Pata Kazi
          </Link>

          <div className="nav-links">
            <a href="#services">Services</a>

            <a href="#how-it-works">How it works</a>

            <Link to="/account">My Account</Link>

            <Link to="/signup">Become a Provider</Link>
          </div>

          <div className="nav-actions">
            <Link to="/" className="login-link">
              Sign in
            </Link>

            <Link to="/signup" className="signup-nav-button">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
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
              <Link to="/signup" className="primary-button">
                Find someone
              </Link>

              <Link to="/signup" className="secondary-button">
                Find work
              </Link>
            </div>

            <div className="search-box">
              <input type="text" placeholder="What service do you need?" />

              <input type="text" placeholder="Enter your location" />

              <button type="button">Search</button>
            </div>
          </div>
        </section>

        {/* Services Section */}
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

                <button type="button">Explore</button>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <p>How it works</p>

            <h2>Getting things done is simple</h2>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <span>01</span>

              <h3>Post your task</h3>

              <p>
                Tell us what you need done, where you need it, and when you need
                it.
              </p>
            </div>

            <div className="step-card">
              <span>02</span>

              <h3>Choose a provider</h3>

              <p>
                Review available service providers, prices, ratings, and
                experience.
              </p>
            </div>

            <div className="step-card">
              <span>03</span>

              <h3>Get it done</h3>

              <p>
                Hire the provider that works for you and get your task
                completed.
              </p>
            </div>
          </div>
        </section>

        {/* Provider Section */}
        <section className="provider-section">
          <div className="provider-content">
            <div>
              <p className="provider-label">Earn with Pata Kazi</p>

              <h2>Turn your skills into income.</h2>

              <p className="provider-description">
                Create your profile, choose the services you offer, and connect
                with customers looking for your skills.
              </p>
            </div>

            <Link to="/signup" className="provider-button">
              Become a provider
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
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
