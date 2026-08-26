import React from "react";
import { Link } from "react-router-dom";
import "./terms.css";

function Terms() {
  return (
    <div className="terms-page">
      <nav className="terms-navbar">
        <div className="terms-nav-container">
          <Link to="/home" className="terms-logo">
            Pata Kazi
          </Link>

          <div className="terms-nav-links">
            <Link to="/home">Home</Link>
            <Link to="/signup">Create account</Link>
            <Link to="/">Sign in</Link>
          </div>
        </div>
      </nav>

      <main className="terms-main">
        <div className="terms-header">
          <p className="terms-label">Legal</p>

          <h1>Terms & Conditions</h1>

          <p className="terms-intro">
            These Terms & Conditions explain the rules for using Pata Kazi. By
            creating an account or using the platform, you agree to these terms.
          </p>

          <span className="terms-updated">Last updated: August 26, 2026</span>
        </div>

        <div className="terms-layout">
          <aside className="terms-sidebar">
            <a href="#acceptance">1. Acceptance</a>
            <a href="#platform">2. Our Platform</a>
            <a href="#accounts">3. User Accounts</a>
            <a href="#customers">4. Customers</a>
            <a href="#providers">5. Service Providers</a>
            <a href="#conduct">6. User Conduct</a>
            <a href="#payments">7. Payments</a>
            <a href="#reviews">8. Reviews</a>
            <a href="#safety">9. Safety</a>
            <a href="#liability">10. Liability</a>
            <a href="#termination">11. Termination</a>
            <a href="#changes">12. Changes</a>
            <a href="#contact">13. Contact</a>
          </aside>

          <section className="terms-content">
            <div className="terms-section" id="acceptance">
              <h2>1. Acceptance of Terms</h2>

              <p>
                By accessing, registering for, or using Pata Kazi, you agree to
                follow these Terms & Conditions and any policies referenced
                within them.
              </p>

              <p>
                If you do not agree with these terms, you should not use the
                platform.
              </p>
            </div>

            <div className="terms-section" id="platform">
              <h2>2. What Pata Kazi Does</h2>

              <p>
                Pata Kazi is a marketplace that helps customers connect with
                independent service providers who offer local services.
              </p>

              <p>
                Pata Kazi provides the technology used to connect users but does
                not directly perform the services listed by independent
                providers unless explicitly stated otherwise.
              </p>
            </div>

            <div className="terms-section" id="accounts">
              <h2>3. User Accounts</h2>

              <p>
                You may be required to create an account to access certain
                features of Pata Kazi.
              </p>

              <ul>
                <li>You must provide accurate and current information.</li>
                <li>You are responsible for keeping your password secure.</li>
                <li>
                  You are responsible for activity performed through your
                  account.
                </li>
                <li>
                  You must notify Pata Kazi if you believe your account has been
                  compromised.
                </li>
                <li>
                  You may not impersonate another person or create misleading
                  accounts.
                </li>
              </ul>
            </div>

            <div className="terms-section" id="customers">
              <h2>4. Customer Responsibilities</h2>

              <p>
                Customers are responsible for providing accurate information
                when requesting a service, including the type of work, location,
                timing, and any important conditions affecting the task.
              </p>

              <p>
                Customers should treat service providers respectfully and
                provide a safe environment in which agreed services can be
                completed.
              </p>
            </div>

            <div className="terms-section" id="providers">
              <h2>5. Service Provider Responsibilities</h2>

              <p>
                Service providers are independent users offering services
                through the platform.
              </p>

              <ul>
                <li>
                  Providers must accurately represent their skills and
                  experience.
                </li>
                <li>
                  Providers should only accept work they are reasonably
                  qualified to perform.
                </li>
                <li>
                  Providers are responsible for complying with applicable laws,
                  permits, licenses, and professional requirements.
                </li>
                <li>
                  Providers are responsible for the quality and completion of
                  services they agree to perform.
                </li>
              </ul>
            </div>

            <div className="terms-section" id="conduct">
              <h2>6. Acceptable Use and Conduct</h2>

              <p>
                Users must not use Pata Kazi for unlawful, harmful, fraudulent,
                abusive, or deceptive activities.
              </p>

              <p>You may not:</p>

              <ul>
                <li>Harass, threaten, or abuse another user.</li>
                <li>Post false or misleading information.</li>
                <li>Use another person's account without permission.</li>
                <li>
                  Attempt to interfere with the security or operation of the
                  platform.
                </li>
                <li>
                  Use Pata Kazi to facilitate illegal goods, services, or
                  activities.
                </li>
              </ul>
            </div>

            <div className="terms-section" id="payments">
              <h2>7. Payments and Fees</h2>

              <p>
                Where payments are supported through Pata Kazi, customers are
                responsible for paying the agreed amount for completed services.
              </p>

              <p>
                Pata Kazi may introduce platform fees, service fees, payment
                processing fees, or other charges. Any applicable charges should
                be presented to users before they confirm a transaction.
              </p>
            </div>

            <div className="terms-section" id="reviews">
              <h2>8. Ratings and Reviews</h2>

              <p>
                Users may be able to submit ratings and reviews after completing
                transactions.
              </p>

              <p>
                Reviews should reflect genuine experiences. Pata Kazi may remove
                content that is fraudulent, abusive, discriminatory, unrelated
                to the service, or otherwise violates platform policies.
              </p>
            </div>

            <div className="terms-section" id="safety">
              <h2>9. Safety</h2>

              <p>
                Users are responsible for exercising reasonable care when
                interacting with people they meet through Pata Kazi.
              </p>

              <p>
                Pata Kazi may introduce identity checks, provider verification,
                reporting tools, background screening, or other safety features,
                but no verification process can eliminate all risk.
              </p>
            </div>

            <div className="terms-section" id="liability">
              <h2>10. Limitation of Liability</h2>

              <p>
                Pata Kazi provides a platform that connects customers and
                independent service providers. The platform does not guarantee
                the quality, suitability, availability, safety, or outcome of
                services provided by independent users.
              </p>

              <p>
                To the extent permitted by applicable law, Pata Kazi will not be
                responsible for indirect or consequential losses arising from
                interactions between users or services arranged through the
                platform.
              </p>
            </div>

            <div className="terms-section" id="termination">
              <h2>11. Suspension and Termination</h2>

              <p>
                Pata Kazi may restrict, suspend, or terminate accounts that
                violate these Terms & Conditions, threaten user safety, engage
                in fraud, misuse the platform, or create significant risk to
                other users or Pata Kazi.
              </p>
            </div>

            <div className="terms-section" id="changes">
              <h2>12. Changes to These Terms</h2>

              <p>
                These Terms & Conditions may be updated as Pata Kazi develops
                new features, changes its services, or responds to legal and
                regulatory requirements.
              </p>

              <p>
                The latest version will be made available on this page together
                with the date it was last updated.
              </p>
            </div>

            <div className="terms-section" id="contact">
              <h2>13. Contact Us</h2>

              <p>
                If you have questions about these Terms & Conditions, you can
                contact the Pata Kazi team through the contact information
                provided on the platform.
              </p>
            </div>

            <div className="terms-bottom">
              <p>
                By continuing to use Pata Kazi, you acknowledge that you have
                read and understood these Terms & Conditions.
              </p>

              <Link to="/signup" className="terms-back-button">
                Back to signup
              </Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="terms-footer">
        <div className="terms-footer-container">
          <strong>Pata Kazi</strong>

          <p>© 2026 Pata Kazi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Terms;
