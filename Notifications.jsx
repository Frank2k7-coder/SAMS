import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Notifications.css";

const Notifications = ({ setNotificationCount }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    const admin = sessionStorage.getItem("admin");
    if (!admin) navigate("/Login");
  }, [navigate]);

  // Function to fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/overstay-notifications");
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || data.message || "Unknown server error");

      setNotifications(data.notifications || []);
      setNotificationCount(data.count || 0);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // Function to mark as left
  const markAsLeft = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "outside" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message);

      fetchNotifications(); // refresh after update
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="notifications">
      <h3>Notifications</h3>
      {isLoading ? (
        <p>Loading notifications...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : notifications.length === 0 ? (
        <p>No overstaying person 🎉</p>
      ) : (
        <ul>
          {notifications.map((n) => (
            <li key={n.userId}>
              <strong>{n.message}</strong> (Status: {n.status}){" "}
              <button onClick={() => markAsLeft(n.userId)}>Mark as Left</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
