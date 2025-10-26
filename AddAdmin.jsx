import React, { useState,useEffect } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";

const AddAdmin = () => {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const trimmedUserName = username.trim();

    // ✅ Validation check
    if (!trimmedUserName || !role || !password) {
      setMessage("Please fill all required fields.");
      setSuccess(false);
      setIsLoading(false);
      return;
    }

    if (password.length < 4) {
      setMessage("Password must be at least 4 characters long.");
      setSuccess(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/AddAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: trimmedUserName,
          password,
          role,
        }),
      });

      const data = await response.json();

 if (response.ok) {
  setMessage(data.message || "Login successful!");
  setSuccess(true);

  // Clear input fields
  setUsername("");
  setPassword("");
  setRole("");

  // Store minimal user info for dashboard
  sessionStorage.setItem("admin", JSON.stringify({
    id: data.admin.id,
    username: data.admin.username,
    role: data.admin.role
  }));

  // 🚀 Redirect to dashboard
  window.location.href = "/Dashboard";  // <-- THIS LINE is the redirect
}
 else {
        setMessage(data.message || "Login failed.");
        setSuccess(false);
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
      setMessage("Error connecting to server. Make sure the backend is running.");
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-image">
          <img src="/logo.svg" alt="Login" />
        </div>

        <div className="form-container">
          <h2>Add the Admin</h2>
          <p className="subtitle">The Admin you will add will be able to control the Panel</p>

          {message && (
            <div className={`message ${success ? "success" : "error"}`}>
              <span className="icon">{success ? "✓" : "!"}</span>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Name of the Staff</label>
              <input
                id="username"
                type="text"
                placeholder="Enter full name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="role">Role of that staff</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select Role</option>
                <option value="admin">Security Staff</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="password">Create Password </label>
              <input
                id="password"
                type="password"
                placeholder="Enter the password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Added in..." : "Add Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAdmin;
