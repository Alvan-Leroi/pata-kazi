import React, { useEffect, useRef, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { io } from "socket.io-client";

import "./JobChat.css";

function JobChat() {
  const navigate = useNavigate();

  const { taskId } = useParams();

  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("pataKaziToken");

  const savedUser = JSON.parse(localStorage.getItem("pataKaziUser") || "null");

  const [task, setTask] = useState(null);

  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [isSending, setIsSending] = useState(false);

  const [error, setError] = useState("");

  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef(null);

  const messagesEndRef = useRef(null);

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
  SCROLL TO NEWEST MESSAGE
  ========================================
  */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /*
  ========================================
  LOAD INITIAL CHAT
  ========================================

  This request only loads the existing
  messages when the page first opens.

  Socket.IO handles new messages after
  this initial load.
  */

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    if (!API_URL) {
      setError("The API URL is not configured.");

      setIsLoading(false);

      return;
    }

    if (!taskId) {
      setError("The task ID is missing.");

      setIsLoading(false);

      return;
    }

    let active = true;

    let didTimeout = false;

    const controller = new AbortController();

    /*
    Render free services can sometimes
    wake slowly, so allow 30 seconds.
    */

    const timeoutId = setTimeout(() => {
      if (!active) {
        return;
      }

      didTimeout = true;

      controller.abort();
    }, 30000);

    const loadConversation = async () => {
      try {
        if (!active) {
          return;
        }

        setIsLoading(true);

        setError("");

        console.log(
          "Loading conversation:",
          `${API_URL}/api/messages/task/${taskId}`,
        );

        const response = await fetch(`${API_URL}/api/messages/task/${taskId}`, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          signal: controller.signal,
        });

        if (!active) {
          return;
        }

        const data = await readResponse(response);

        if (!active) {
          return;
        }

        console.log("Conversation status:", response.status);

        if (!response.ok) {
          setError(data.message || "Unable to load the conversation.");

          return;
        }

        setTask(data.task || null);

        setMessages(Array.isArray(data.messages) ? data.messages : []);

        /*
          Successful request.
          Remove any old error.
          */

        setError("");
      } catch (requestError) {
        /*
          Very important:

          React may clean up an effect
          while developing.

          Do not show an error when
          that cleanup intentionally
          aborted the request.
          */

        if (!active) {
          return;
        }

        console.error("Conversation load error:", requestError);

        if (requestError.name === "AbortError" && didTimeout) {
          setError(
            "The server took too long to load the conversation. Please try again.",
          );
        } else if (requestError.name !== "AbortError") {
          setError(`Unable to load conversation: ${requestError.message}`);
        }
      } finally {
        clearTimeout(timeoutId);

        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadConversation();

    return () => {
      /*
      Mark this effect inactive FIRST.

      This prevents the old request from
      changing state after React starts
      another copy of the effect.
      */

      active = false;

      clearTimeout(timeoutId);

      controller.abort();
    };
  }, [API_URL, navigate, taskId, token]);

  /*
  ========================================
  SOCKET.IO REAL-TIME CONNECTION
  ========================================
  */

  useEffect(() => {
    if (!token || !API_URL || !taskId || !task) {
      return;
    }

    let active = true;

    /*
    If an old socket somehow still
    exists, close it first.
    */

    if (socketRef.current) {
      socketRef.current.disconnect();

      socketRef.current = null;
    }

    setSocketConnected(false);

    const socket = io(API_URL, {
      auth: {
        token,
      },

      /*
        Start with WebSocket.

        Socket.IO can fall back to
        polling when necessary.
        */

      transports: ["websocket", "polling"],

      reconnection: true,

      reconnectionAttempts: Infinity,

      reconnectionDelay: 1000,

      reconnectionDelayMax: 5000,

      timeout: 20000,
    });

    socketRef.current = socket;

    /*
    ========================================
    CONNECTED
    ========================================
    */

    socket.on("connect", () => {
      if (!active) {
        return;
      }

      console.log("Socket connected:", socket.id);

      setSocketConnected(true);

      setError("");

      socket.emit("join_task", taskId);
    });

    /*
    ========================================
    JOINED PRIVATE TASK ROOM
    ========================================
    */

    socket.on("joined_task", (data) => {
      if (!active) {
        return;
      }

      console.log("Joined task room:", data.taskId);

      setSocketConnected(true);
    });

    /*
    ========================================
    RECEIVE MESSAGE INSTANTLY
    ========================================
    */

    socket.on("new_message", (incomingMessage) => {
      if (!active) {
        return;
      }

      console.log("New real-time message:", incomingMessage);

      setMessages((currentMessages) => {
        const alreadyExists = currentMessages.some(
          (message) => message._id === incomingMessage._id,
        );

        if (alreadyExists) {
          return currentMessages;
        }

        return [...currentMessages, incomingMessage];
      });
    });

    /*
    ========================================
    SERVER CHAT ERROR
    ========================================
    */

    socket.on("chat_error", (data) => {
      if (!active) {
        return;
      }

      console.error("Chat room error:", data);

      setError(data.message || "Unable to access this conversation.");
    });

    /*
    ========================================
    SOCKET CONNECTION ERROR
    ========================================
    */

    socket.on("connect_error", (socketError) => {
      if (!active) {
        return;
      }

      console.error("Socket connection error:", socketError.message);

      setSocketConnected(false);
    });

    /*
    ========================================
    RECONNECT ATTEMPT
    ========================================
    */

    socket.io.on("reconnect_attempt", () => {
      if (!active) {
        return;
      }

      console.log("Attempting to reconnect chat...");

      setSocketConnected(false);
    });

    /*
    ========================================
    SUCCESSFUL RECONNECT
    ========================================
    */

    socket.io.on("reconnect", () => {
      if (!active) {
        return;
      }

      console.log("Chat reconnected");

      setSocketConnected(true);

      socket.emit("join_task", taskId);
    });

    /*
    ========================================
    DISCONNECTED
    ========================================
    */

    socket.on("disconnect", (reason) => {
      /*
        Do NOT let an old socket
        overwrite the state belonging
        to the new socket.
        */

      if (!active) {
        return;
      }

      console.log("Socket disconnected:", reason);

      setSocketConnected(false);
    });

    /*
    ========================================
    CLEANUP
    ========================================
    */

    return () => {
      /*
      This MUST happen before
      socket.disconnect().
      */

      active = false;

      socket.off("connect");

      socket.off("joined_task");

      socket.off("new_message");

      socket.off("chat_error");

      socket.off("connect_error");

      socket.off("disconnect");

      socket.io.off("reconnect_attempt");

      socket.io.off("reconnect");

      socket.emit("leave_task", taskId);

      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [API_URL, task, taskId, token]);

  /*
  ========================================
  SEND MESSAGE
  ========================================
  */

  const handleSend = async (event) => {
    event.preventDefault();

    const cleanMessage = newMessage.trim();

    if (!cleanMessage || isSending) {
      return;
    }

    try {
      setIsSending(true);

      setError("");

      const response = await fetch(`${API_URL}/api/messages/task/${taskId}`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          text: cleanMessage,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        setError(data.message || "Unable to send message.");

        return;
      }

      /*
        Clear the textbox.

        The socket normally adds
        the message immediately.
        */

      setNewMessage("");

      /*
        Safety fallback:

        If the socket disconnected
        exactly while sending, still
        show our sent message.
        */

      if (!socketRef.current?.connected && data.data) {
        setMessages((currentMessages) => {
          const exists = currentMessages.some(
            (message) => message._id === data.data._id,
          );

          if (exists) {
            return currentMessages;
          }

          return [...currentMessages, data.data];
        });
      }
    } catch (sendError) {
      console.error("Send message error:", sendError);

      setError(`Unable to send message: ${sendError.message}`);
    } finally {
      setIsSending(false);
    }
  };

  /*
  ========================================
  ENTER SEND
  ========================================
  */

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      handleSend(event);
    }
  };

  /*
  ========================================
  COMPLETE JOB
  ========================================
  */

  const handleComplete = async () => {
    const confirmed = window.confirm(
      "Has this service been completed? This will close the active job.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/api/tasks/${taskId}/complete`, {
        method: "PATCH",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);

      if (!response.ok) {
        setError(data.message || "Unable to complete job.");

        return;
      }

      navigate("/home");
    } catch (completeError) {
      console.error("Complete job error:", completeError);

      setError("Unable to complete job.");
    }
  };

  /*
  ========================================
  USERS
  ========================================
  */

  const customer = task?.customerId;

  const provider = task?.assignedProviderId;

  const isCustomer = savedUser?.role === "customer";

  const otherUser = isCustomer ? provider : customer;

  /*
  ========================================
  IS THIS MY MESSAGE?
  ========================================
  */

  const isMyMessage = (message) => {
    const senderId = message.senderId?._id || message.senderId;

    const currentUserId = savedUser?._id;

    return senderId?.toString() === currentUserId?.toString();
  };

  /*
  ========================================
  FORMAT TIME
  ========================================
  */

  const formatTime = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    return new Date(dateValue).toLocaleTimeString("en-KE", {
      hour: "2-digit",

      minute: "2-digit",
    });
  };

  /*
  ========================================
  LOADING
  ========================================
  */

  if (isLoading) {
    return (
      <div className="job-chat-page">
        <div className="job-chat-loading">Loading conversation...</div>
      </div>
    );
  }

  /*
  ========================================
  PAGE
  ========================================
  */

  return (
    <div className="job-chat-page">
      <nav className="job-chat-navbar">
        <div className="job-chat-navbar-container">
          <Link
            to={isCustomer ? "/home" : "/provider"}
            className="job-chat-logo"
          >
            Pata Kazi
          </Link>

          <div className="job-chat-nav-right">
            <div
              className={`job-chat-connection ${
                socketConnected ? "job-chat-connected" : "job-chat-disconnected"
              }`}
            >
              <span className="job-chat-connection-dot"></span>

              {socketConnected ? "Live" : "Connecting..."}
            </div>

            <Link
              to={isCustomer ? "/account" : "/provider-account"}
              className="job-chat-account-link"
            >
              My Account
            </Link>
          </div>
        </div>
      </nav>

      <main className="job-chat-container">
        <Link to={isCustomer ? "/home" : "/provider"} className="job-chat-back">
          ← Back to dashboard
        </Link>

        {error && <div className="job-chat-error">{error}</div>}

        {!task ? (
          <div className="job-chat-card">
            <div className="job-chat-empty">
              <h3>Conversation could not be loaded</h3>

              <p>Return to your dashboard and try opening the chat again.</p>
            </div>
          </div>
        ) : (
          <div className="job-chat-card">
            {/* HEADER */}

            <header className="job-chat-header">
              <div className="job-chat-person">
                <div className="job-chat-avatar">
                  {otherUser?.fullName?.charAt(0).toUpperCase() || "U"}
                </div>

                <div>
                  <h2>{otherUser?.fullName || "Pata Kazi User"}</h2>

                  <p>{task.title}</p>
                </div>
              </div>

              <span className="job-chat-status">{task.status}</span>
            </header>

            {/* MESSAGES */}

            <div className="job-chat-messages">
              {messages.length === 0 ? (
                <div className="job-chat-empty">
                  <div className="job-chat-empty-icon">✉</div>

                  <h3>Start the conversation</h3>

                  <p>
                    Messages between you and the other person will appear here
                    instantly.
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const mine = isMyMessage(message);

                  return (
                    <div
                      className={`job-chat-row ${
                        mine ? "job-chat-row-mine" : ""
                      }`}
                      key={message._id}
                    >
                      <div
                        className={`job-chat-bubble ${
                          mine ? "job-chat-bubble-mine" : ""
                        }`}
                      >
                        {!mine && message.senderId?.fullName && (
                          <span className="job-chat-sender-name">
                            {message.senderId.fullName}
                          </span>
                        )}

                        <p>{message.text}</p>

                        <div className="job-chat-message-meta">
                          <span>{formatTime(message.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={messagesEndRef}></div>
            </div>

            {/* SEND MESSAGE */}

            {["assigned", "in-progress"].includes(task.status) && (
              <>
                <form onSubmit={handleSend} className="job-chat-form">
                  <textarea
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${otherUser?.fullName || ""}`}
                    rows="2"
                    maxLength="2000"
                  />

                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </form>

                <div className="job-chat-hint">
                  Press Enter to send • Shift + Enter for a new line
                </div>
              </>
            )}

            {/* CUSTOMER COMPLETE */}

            {isCustomer &&
              ["assigned", "in-progress"].includes(task.status) && (
                <div className="job-chat-complete">
                  <div>
                    <strong>Has the work been completed?</strong>

                    <p>
                      Close this job after the provider finishes the service.
                    </p>
                  </div>

                  <button type="button" onClick={handleComplete}>
                    Mark Job Complete
                  </button>
                </div>
              )}
          </div>
        )}
      </main>
    </div>
  );
}

export default JobChat;
