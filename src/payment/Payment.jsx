import React, { useEffect, useRef, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { io } from "socket.io-client";

import "./Payment.css";

function Payment() {
  const navigate = useNavigate();

  const { taskId } = useParams();

  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("pataKaziToken");

  const savedUser = JSON.parse(localStorage.getItem("pataKaziUser") || "null");

  const [task, setTask] = useState(null);

  const [payment, setPayment] = useState(null);

  const [phoneNumber, setPhoneNumber] = useState(savedUser?.phone || "");

  const [isLoading, setIsLoading] = useState(true);

  const [isPaying, setIsPaying] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef(null);

  /*
  ========================================
  SAFE RESPONSE READER
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
  LOAD TASK
  ========================================
  */

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    if (savedUser?.role !== "customer") {
      navigate("/provider");
      return;
    }

    const loadTask = async () => {
      try {
        setIsLoading(true);

        setMessage("");

        const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await readResponse(response);

        if (!response.ok) {
          setMessage(data.message || "Unable to load task.");

          setMessageType("error");

          return;
        }

        setTask(data);
      } catch (error) {
        console.error("Load payment task error:", error);

        setMessage("Unable to connect to the server.");

        setMessageType("error");
      } finally {
        setIsLoading(false);
      }
    };

    loadTask();
  }, [API_URL, navigate, savedUser?.role, taskId, token]);

  /*
  ========================================
  LOAD EXISTING PAYMENT
  ========================================
  */

  useEffect(() => {
    if (!token || !taskId) {
      return;
    }

    const loadPayment = async () => {
      try {
        const response = await fetch(`${API_URL}/api/payments/task/${taskId}`, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await readResponse(response);

        if (!response.ok) {
          return;
        }

        if (data.payment) {
          setPayment(data.payment);
        }
      } catch (error) {
        console.error("Load payment status error:", error);
      }
    };

    loadPayment();
  }, [API_URL, taskId, token]);

  /*
  ========================================
  REAL-TIME PAYMENT UPDATE
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

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("payment_updated", (update) => {
      if (update.taskId?.toString() !== taskId?.toString()) {
        return;
      }

      setPayment((currentPayment) => ({
        ...currentPayment,

        ...update,
      }));

      if (update.status === "paid") {
        setMessage("Payment successful. M-PESA has confirmed your payment.");

        setMessageType("success");

        setIsPaying(false);
      }

      if (update.status === "cancelled") {
        setMessage("The M-PESA payment was cancelled.");

        setMessageType("error");

        setIsPaying(false);
      }

      if (update.status === "failed") {
        setMessage("The M-PESA payment failed. Please try again.");

        setMessageType("error");

        setIsPaying(false);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Payment socket error:", error.message);

      setSocketConnected(false);
    });

    return () => {
      socket.off("payment_updated");

      socket.disconnect();

      socketRef.current = null;
    };
  }, [API_URL, taskId, token]);

  /*
  ========================================
  FORMAT NUMBER
  ========================================
  */

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString("en-KE");
  };

  /*
  ========================================
  NORMALIZE PHONE FOR DISPLAY
  ========================================
  */

  const normalizeDisplayPhone = (value) => {
    return value.replace(/[^\d+]/g, "").slice(0, 13);
  };

  /*
  ========================================
  START M-PESA PAYMENT
  ========================================
  */

  const handlePayment = async (event) => {
    event.preventDefault();

    if (!phoneNumber.trim()) {
      setMessage("Enter the M-PESA phone number.");

      setMessageType("error");

      return;
    }

    try {
      setIsPaying(true);

      setMessage("Sending M-PESA request to your phone...");

      setMessageType("info");

      const response = await fetch(`${API_URL}/api/payments/mpesa/stk-push`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          taskId,

          phoneNumber: phoneNumber.trim(),
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        setMessage(data.message || "Unable to start M-PESA payment.");

        setMessageType("error");

        setIsPaying(false);

        return;
      }

      setPayment({
        _id: data.paymentId,

        taskId,

        amount: data.amount,

        phoneNumber: data.phoneNumber,

        checkoutRequestId: data.checkoutRequestId,

        status: "pending",
      });

      setMessage("M-PESA request sent. Check your phone and enter your PIN.");

      setMessageType("info");
    } catch (error) {
      console.error("Payment error:", error);

      setMessage("Unable to start payment.");

      setMessageType("error");

      setIsPaying(false);
    }
  };

  /*
  ========================================
  PAYMENT STATUS
  ========================================
  */

  const paymentStatus = payment?.status || "not-started";

  const isPaid = paymentStatus === "paid";

  const isPending = paymentStatus === "pending";

  /*
  ========================================
  LOADING
  ========================================
  */

  if (isLoading) {
    return (
      <div className="payment-page">
        <div className="payment-loading">Loading payment...</div>
      </div>
    );
  }

  /*
  ========================================
  PAGE
  ========================================
  */

  return (
    <div className="payment-page">
      <nav className="payment-navbar">
        <div className="payment-navbar-container">
          <Link to="/home" className="payment-logo">
            Pata Kazi
          </Link>

          <Link to="/account" className="payment-account-link">
            My Account
          </Link>
        </div>
      </nav>

      <main className="payment-container">
        <Link to="/home" className="payment-back-link">
          ← Back to dashboard
        </Link>

        <div className="payment-layout">
          <section className="payment-main-card">
            <div className="payment-heading">
              <p className="payment-eyebrow">Secure payment</p>

              <h1>Pay with M-PESA</h1>

              <p>Complete your payment for this Pata Kazi job.</p>
            </div>

            {message && (
              <div className={`payment-message payment-message-${messageType}`}>
                {message}
              </div>
            )}

            {isPaid ? (
              <div className="payment-success-area">
                <div className="payment-success-icon">✓</div>

                <h2>Payment successful</h2>

                <p>Your payment has been confirmed.</p>

                {payment?.mpesaReceiptNumber && (
                  <div className="payment-receipt">
                    <span>M-PESA Receipt</span>

                    <strong>{payment.mpesaReceiptNumber}</strong>
                  </div>
                )}

                <Link
                  to={`/task/${taskId}/chat`}
                  className="payment-continue-button"
                >
                  Message Provider
                </Link>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="payment-form">
                <div className="payment-field">
                  <label htmlFor="mpesaPhone">M-PESA phone number</label>

                  <input
                    id="mpesaPhone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(event) =>
                      setPhoneNumber(normalizeDisplayPhone(event.target.value))
                    }
                    placeholder="e.g. 0712345678"
                    autoComplete="tel"
                    disabled={isPaying || isPending}
                  />

                  <small>
                    Enter the Safaricom number that should receive the M-PESA
                    prompt.
                  </small>
                </div>

                {isPending ? (
                  <div className="payment-waiting-card">
                    <div className="payment-spinner"></div>

                    <div>
                      <strong>Waiting for M-PESA</strong>

                      <p>Check your phone and enter your M-PESA PIN.</p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="payment-submit-button"
                    disabled={isPaying}
                  >
                    {isPaying ? "Sending request..." : "Pay with M-PESA"}
                  </button>
                )}

                <div className="payment-security-note">
                  <span>🔒</span>

                  <p>
                    Pata Kazi does not ask for or store your M-PESA PIN. Your
                    PIN is entered directly on your phone.
                  </p>
                </div>
              </form>
            )}
          </section>

          <aside className="payment-summary-card">
            <p className="payment-summary-label">Payment summary</p>

            <h2>{task?.title || "Pata Kazi Job"}</h2>

            <div className="payment-summary-details">
              <div>
                <span>Service</span>

                <strong>{task?.category || "Service"}</strong>
              </div>

              <div>
                <span>Location</span>

                <strong>{task?.location || "Not available"}</strong>
              </div>

              {task?.assignedProviderId?.fullName && (
                <div>
                  <span>Provider</span>

                  <strong>{task.assignedProviderId.fullName}</strong>
                </div>
              )}
            </div>

            <div className="payment-total">
              <span>Amount</span>

              <strong>
                KES {formatMoney(payment?.amount || task?.budget)}
              </strong>
            </div>

            <div className="payment-live-status">
              <span
                className={`payment-live-dot ${
                  socketConnected ? "payment-live-dot-connected" : ""
                }`}
              ></span>

              {socketConnected
                ? "Live payment updates"
                : "Connecting to payment updates"}
            </div>

            <div className="payment-sandbox-note">Sandbox testing</div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Payment;
