import React, { useEffect, useState, useRef } from "react"; 
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,  
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./Dashboard.css";

function Dashboard({ dataRetention, onDataRetentionChange }) {
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({
    dataRetention: dataRetention || 7
  });

  const storedAdmin = sessionStorage.getItem("admin");
  const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
  const userId = admin?.id;

  useEffect(() => {
    const admin = sessionStorage.getItem("admin");
    if (!admin) navigate("/Login");
  }, [navigate]);

 const fetchUsers = async () => {
  try {
    setIsLoading(true);
    console.log("🔄 Fetching users from:", `http://localhost:5000/dashboard-data?days=${dataRetention}`);
    
    const response = await fetch(`http://localhost:5000/dashboard-data?days=${dataRetention}`);
    
    console.log("📡 Response status:", response.status);
    console.log("📡 Response ok:", response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ HTTP error details:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Data received:", data);
    console.log("Data type:", typeof data);
    console.log("Data length:", Array.isArray(data) ? data.length : 'Not an array');
    
    setUsers(data);
    setError("");
    
  } catch (err) {
    console.error("❌ Fetch error:", err);
    setError(err.message || "Failed to fetch users");
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    if (userId) {
      fetchProfiles();
    }
  }, [userId]);

  const fetchProfiles = async () => {
    try {
      const response = await fetch(`http://localhost:5000/profile/${userId}`, { 
        method: "GET" 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Profiles error:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [dataRetention]);

const handleDeleteUser = async (id) => {
 try {
      const response = await fetch(`http://localhost:5000/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        
      });

  } catch (error) {
    console.error('Delete failed:', error);
  }
};

  const handleDataRetentionChange = async (e) => {
    const value = Number(e.target.value);
    
    // Update local state
    setSettings(prev => ({
      ...prev,
      dataRetention: value
    }));

    try {
      const response = await fetch("http://localhost:5000/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "dataRetention", value }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update settings");
      }

      const data = await response.json();
      console.log("Data retention updated:", data.message);

      // Call parent callback if provided
      if (onDataRetentionChange) onDataRetentionChange(value);
      
      // Refresh users with new retention period
      fetchUsers();
    } catch (err) {
      console.error("Error updating data retention:", err);
      alert("Error updating data retention: " + err.message);
    }
  };


  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/users/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Refresh dashboard users
      fetchUsers();

      // Optional: Notify Notifications component
      // fetch("http://localhost:5000/overstay-notifications")
      //   .then(res => res.json())
      //   .then(data => setNotificationCount(data.count));
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status: " + err.message);
    }
  };

  const filteredUsers = users
    .filter(u => u.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(u => statusFilter === "all" ? true : u.status === statusFilter);

  const totalVisitors = users.length;
  const totalInside = users.filter(u => u.status === "Inside").length;
  const totalLeft = users.filter(u => u.status === "Left").length;

  const dailyCounts = Object.values(
    users.reduce((acc, u) => {
      if (u.created_at) {
        const date = u.created_at.split(" ")[0];
        if (!acc[date]) acc[date] = { date, visitors: 0 };
        acc[date].visitors += 1;
      }
      return acc;
    }, {})
  );

  const handleFilterClick = (filter) => {
    setStatusFilter(filter);
    if (tableRef.current) tableRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleImageClick = () => {
    if (profile?.image_url) {
      // You can implement a modal or larger view here
      console.log("Show larger image");
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="profile-container">
          {profile ? (
            <div className="profile-card">      
              <div className="profile-email">
                {profile.email}
              </div>
              {profile.image_url && (
                <img  
                  onClick={handleImageClick}
                  src={profile.image_url} 
                  alt="Profile"
                  className="profile-image"
                />
              )}
              <button className="profile-email" onClick={() => navigate("/Edits")}>
                Edit
              </button>
            </div>
          ) : (
            <div className="no-profile" onClick={() => navigate("/AddProfile")}>
              <i className="fas fa-user-circle" style={{fontSize: '3rem', marginBottom: '10px', display: 'block'}}></i>
              No profile found
            </div>
          )}
        </div>
        
        <h1>Secure Access Management System</h1>
        
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchUsers} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </header>

      {/* Data Retention Settings */}
      <div className="data-retention-settings">
        <label>Data Retention Period: </label>
        <select
          value={settings.dataRetention}
          onChange={handleDataRetentionChange}
        >
          <option value={7}>7 Days</option>
          <option value={30}>30 Days</option>
          <option value={90}>90 Days</option>
          <option value={365}>1 Year</option>
        </select>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-summary">
            <div className="stat-card total" onClick={() => handleFilterClick("all")}>
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <h3>Total Visitors</h3>
                <div className="value">{totalVisitors}</div>
              </div>
            </div>
            
            <div className="stat-card inside" onClick={() => handleFilterClick("Inside")}>
              <div className="stat-icon">
                <i className="fas fa-building"></i>
              </div>
              <div className="stat-content">
                <h3>Currently Inside</h3>
                <div className="value">{totalInside}</div>
              </div>
            </div>
            
            <div className="stat-card left" onClick={() => handleFilterClick("Left")}>
              <div className="stat-icon">
                <i className="fas fa-sign-out-alt"></i>
              </div>
              <div className="stat-content">
                <h3>Left</h3>
                <div className="value">{totalLeft}</div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-container">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Daily Visitors Trend</h3>
                <span className="chart-subtitle">Last {dataRetention} days</span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyCounts}>
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="visitors" stroke="#ff7700" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Current Status</h3>
                <span className="chart-subtitle">Visitor distribution</span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Inside", value: totalInside },
                      { name: "Left", value: totalLeft },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label
                  >
                    <Cell key="inside" fill="#28a745" />
                    <Cell key="left" fill="#dc3545" />
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Records */}
          <div className="recent-activity" ref={tableRef}>
            <div className="section-header">
              <h2>Visitor Records</h2>
              <div className="controls">
                <div className="search-bar">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="filter-tabs">
                  <button 
                    className={statusFilter === "all" ? "active" : ""}
                    onClick={() => setStatusFilter("all")}
                  >
                    All
                  </button>
                  <button 
                    className={statusFilter === "Inside" ? "active" : ""}
                    onClick={() => setStatusFilter("Inside")}
                  >
                    Inside
                  </button>
                  <button 
                    className={statusFilter === "Left" ? "active" : ""}
                    onClick={() => setStatusFilter("Left")}
                  >
                    Left
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>National ID</th>
                    <th>Registered At</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td 
                          className="clickable-name"
                          onClick={() => navigate(`/user/${u.id}`)}
                        >
                          {u.name}
                        </td>
                        <td>{u.national_id}</td>
                        <td>{u.created_at ? new Date(u.created_at).toLocaleString() : 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${u.status?.toLowerCase()}`}>
                            {u.status}
                          </span>
                        </td>
                        <td>{u.role}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="status-btn"
                              onClick={() => updateStatus(u.id, u.status === "Inside" ? "Left" : "Inside")}
                            >
                              <i className={u.status === "Inside" ? "fas fa-sign-out-alt" : "fas fa-building"}></i>
                              {u.status === "Inside" ? "Mark as Left" : "Mark as Inside"}
                            </button>

                            <button 
                    className="delete-btn"
                   onClick={() => {
                console.log(" Direct delete click - User ID:", u.id);
                 if (window.confirm("Are you sure you want to delete?")) {
                handleDeleteUser(u.id);
               }
            }}
                  >
                              <i className="fas fa-trash"></i>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
                        <i className="fas fa-inbox"></i>
                        <p>No visitors found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;