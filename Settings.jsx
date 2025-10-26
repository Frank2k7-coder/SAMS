import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiMoon, 
  FiSun, 
  FiGlobe, 
  FiSave,
  FiRefreshCw,
  FiUserPlus,
  FiShield,
  FiBell,
  FiHardDrive,
  FiLock,
  FiUsers,
  FiDownload
} from "react-icons/fi";
import "./Settings.css";

function Settings({ onThemeChange, currentTheme, onDataRetentionChange }) {
  const navigate = useNavigate();
     
const [role, setRole] = useState("");

useEffect(() => {
  const adminData = sessionStorage.getItem("admin");
  if (!adminData) {
    navigate("/Login");
  } else {
    try {
      const parsed = JSON.parse(adminData);
      setRole(parsed.role); // 👈 store role
    } catch (err) {
      console.error("Invalid admin data in sessionStorage:", err);
    }
  }
}, [navigate]);


  const [settings, setSettings] = useState({
    notifications: true,
    overstayLimit: 24,
    schoolName: "AGAHOZO SCHOOL YOUTH VILLAGE",
    language: "english",
    autoBackup: true,
    emergencyAlerts: true,
    dataRetention: 30,
    requirePasswordChange: false,
    loginAttempts: 3
  });

  const [saveStatus, setSaveStatus] = useState("idle");

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  //HOURS OVERSTAYING
  const handleOverstayLimitChange = async (e) => {
  const value = Number(e.target.value);
  handleInputChange("overstayLimit", value);

  try {
    const response = await fetch("http://localhost:5000/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "overstayLimit", value }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update");

    console.log("Overstay limit updated:", data.message);
  } catch (err) {
    alert("Error updating overstay limit: " + err.message);
  }
};


  // ✅ Data Retention change: updates backend & dashboard
  const handleDataRetentionChange = async (e) => {
    const value = Number(e.target.value);
    handleInputChange("dataRetention", value);

    try {
      const response = await fetch("http://localhost:5000/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "dataRetention", value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update");

      console.log("Data retention updated:", data.message);

      if (onDataRetentionChange) onDataRetentionChange(value);
    } catch (err) {
      alert("Error updating data retention: " + err.message);
    }
  };

  const saveSettings = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1500);
  };

  const handleResetSystem = () => {
    if (window.confirm("Are you sure you want to reset the system? This action cannot be undone.")) {
      alert("System has been reset to default settings!");
      setSettings({
        notifications: true,
        overstayLimit: 24,
        schoolName: "AGAHOZO SCHOOL YOUTH VILLAGE",
        language: "english",
        autoBackup: true,
        emergencyAlerts: true,
        dataRetention: 30,
        requirePasswordChange: false,
        loginAttempts: 3
      });
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1><FiShield /> System Settings</h1>
        <button className={`save-btn ${saveStatus}`} onClick={saveSettings} disabled={saveStatus === "saving"}>
          {saveStatus === "saving" ? <FiRefreshCw className="spinning" /> : <FiSave />}
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="settings-grid">
        {/* General Settings */}
        <div className="settings-card">
          <h2><FiHardDrive /> General Settings</h2>

          <div className="form-group">
            <label>School Name</label>
            <input
              type="text"
              value={settings.schoolName}
              onChange={(e) => handleInputChange("schoolName", e.target.value)}
              placeholder="Enter school name"
            />
          </div>

          <div className="form-group">
            <label>Data Retention Period</label>
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

          <div className="form-group">
            <label>Overstay Limit</label>
            <select
  value={settings.overstayLimit}
  onChange={handleOverstayLimitChange}
>
  <option value={12}>12 Hours</option>
  <option value={24}>24 Hours</option>
  <option value={48}>48 Hours</option>
  <option value={72}>72 Hours</option>
</select>

          </div>
        </div>

        {/* Notification Preferences */}
        <div className="settings-card">
          <h2><FiBell /> Notification Preferences</h2>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={() => handleInputChange("notifications", !settings.notifications)}
              />
              Enable Notifications
            </label>
          </div>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.emergencyAlerts}
                onChange={() => handleInputChange("emergencyAlerts", !settings.emergencyAlerts)}
              />
              Emergency Alerts
            </label>
          </div>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={() => handleInputChange("autoBackup", !settings.autoBackup)}
              />
              Automatic Backup
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="settings-card">
          <h2><FiLock /> Security Settings</h2>
          <div className="form-group">
            <label>Failed Login Attempts Before Lockout</label>
            <select
              value={settings.loginAttempts}
              onChange={(e) => handleInputChange("loginAttempts", Number(e.target.value))}
            >
              <option value={3}>3 Attempts</option>
              <option value={5}>5 Attempts</option>
              <option value={10}>10 Attempts</option>
            </select>
          </div>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.requirePasswordChange}
                onChange={() => handleInputChange("requirePasswordChange", !settings.requirePasswordChange)}
              />
              Require Password Change Every 90 Days
            </label>
          </div>
        </div>

        {/* Appearance & Language */}
        <div className="settings-card">
          <h2><FiGlobe /> Appearance & Language</h2>
          <div className="theme-selector">
            <label>Interface Theme</label>
            <div className="theme-buttons">
              <button className={currentTheme === 'light' ? 'active' : ''} onClick={() => onThemeChange('light')}>
                <FiSun /> Light
              </button>
              <button className={currentTheme === 'dark' ? 'active' : ''} onClick={() => onThemeChange('dark')}>
                <FiMoon /> Dark
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Language</label>
            <select
              value={settings.language}
              onChange={(e) => handleInputChange("language", e.target.value)}
            >
              <option value="english">English</option>
              <option value="kinyarwanda">Kinyarwanda</option>
            </select>
          </div>
        </div>

        {/* User Management */}
<div className="settings-card">
  <h2><FiUsers /> User Management</h2>

  {role === "super-admin" && (
    <button className="action-btn" 
    onClick={() => navigate("/AddAdmin")}>
      <FiUserPlus /> Add New Admin
    </button>
  )}

  <button className="action-btn" onClick={() => navigate("/manage-security")}>
    <FiShield /> Manage Security Staff
  </button>

  <button className="action-btn" onClick={() => navigate("/AddProfile")}>
    <FiUserPlus/> Add Profile
  </button>
  <button className="action-btn" onClick={() => navigate("/export-users")}>
    <FiDownload /> Export User Data
  </button>


</div>




        {/* System Controls */}
        <div className="settings-card danger-zone">
          <h2>System Controls</h2>
          <div className="system-info">
            <p>System Version: <strong>v2.3.1</strong></p>
            <p>Last Backup: <strong>Today, 14:30</strong></p>
            <p>Storage Usage: <strong>2.3GB / 10GB</strong></p>
          </div>
          <button className="action-btn"><FiDownload /> Create Backup Now</button>
          <button className="reset-btn" onClick={handleResetSystem}><FiRefreshCw /> Reset System to Defaults</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;