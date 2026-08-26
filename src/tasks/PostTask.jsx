import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PostTask.css";

function PostTask() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    budget: "",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    "Cleaning",
    "Moving",
    "Furniture Assembly",
    "Handyman",
    "Delivery",
    "Yard Work",
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    const token = localStorage.getItem("pataKaziToken");

    if (!token) {
      setMessage("Please sign in before posting a task.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          location: formData.location,
          budget: Number(formData.budget),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to create task.");
        return;
      }

      setMessage("Task posted successfully.");

      console.log("TASK CREATED:", data);

      setTimeout(() => {
        navigate(`/task/${data.task._id}/providers`);
      }, 800);
    } catch (error) {
      console.error("Task creation error:", error);

      setMessage("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="post-task-page">
      <div className="post-task-container">
        <div className="post-task-heading">
          <p className="post-task-label">Pata Kazi</p>

          <h1>Post a task</h1>

          <p>
            Tell us what you need done and we’ll help you find matching service
            providers.
          </p>
        </div>

        <div className="post-task-card">
          {message && <div className="task-message">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="task-form-group">
              <label htmlFor="title">Task title</label>

              <input
                id="title"
                type="text"
                name="title"
                placeholder="e.g. Need help moving furniture"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="task-form-group">
              <label htmlFor="category">Service category</label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="task-form-group">
              <label htmlFor="description">Description</label>

              <textarea
                id="description"
                name="description"
                placeholder="Describe what you need done..."
                value={formData.description}
                onChange={handleChange}
                rows="5"
                required
              />
            </div>

            <div className="task-form-grid">
              <div className="task-form-group">
                <label htmlFor="location">Location</label>

                <input
                  id="location"
                  type="text"
                  name="location"
                  placeholder="e.g. Nairobi"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="task-form-group">
                <label htmlFor="budget">Budget (KES)</label>

                <input
                  id="budget"
                  type="number"
                  name="budget"
                  min="0"
                  placeholder="e.g. 2500"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="post-task-button"
              disabled={isLoading}
            >
              {isLoading ? "Posting task..." : "Post task"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostTask;
