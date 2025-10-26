import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate,Navigate } from "react-router-dom";

import Home from "./Home";
import Dashboard from "./Dashboard";

import Login from "./Login";
import Register from "./Register";
import AddAdmin from "./AddAdmin";
import Settings from "./Settings";
import Edits from "./Edits";
import AddProfile from "./AddProfile";
import Notifications from "./Notifications";
import Chat from "./Chat"; 
import UserDetails from "./userDetail";
import "./App.css";

function App() {
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn]= useState(false);
  const [role, setRole]= useState("");
  const navigate= useNavigate();

  useEffect(()=>{
    const adminData  =sessionStorage.getItem("admin");
    if(adminData) {
      const admin = JSON.parse(adminData);
      setIsLoggedIn(true);
      setRole(admin.role);
    }
  },[]);

 
  const handleLogout = () => {
    sessionStorage.removeItem("admin");
    setIsLoggedIn(false)
    navigate("/Login")
    
  };


  return (

      <div className="app">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-brand">
            <div className="logo">
              <img src="/logo.svg" alt="SAMS Logo" />
            </div>
            <div className="brand-text">
              <h4>SAMS</h4>
              <span>Secure Access Management</span>
            </div>
          </div>

          <div className="nav-links">
            <NavLink to="/Home" className="nav-item" end>
              <i className="fas fa-home"></i>
              <span>Home</span>
            </NavLink>

            <NavLink to="/Dashboard" className="nav-item" end>
              <i className="fas fa-tachometer-alt"></i>
              <span>Admin Panel</span>
            </NavLink>

            {role !=="super-admin" && <NavLink to="/Register" className="nav-item" end>
              <i className="fas fa-user-plus"></i>
              <span>Register User</span>
            </NavLink>}

             <NavLink to="/Chat" className="nav-item" end>
              <i className="fas fa-sign-in-alt"></i>
              <span>Chat</span>
            </NavLink> 

            <NavLink to="/Settings" className="nav-item" end>
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </NavLink>

            <NavLink to="/Notifications" className="nav-item" end>
              <i className="fas fa-bell"></i>
              <span>Notifications</span>
              {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
            </NavLink>
            
             {!isLoggedIn && <button onClick={()=>navigate("/Login")} className="nav-item logout-btn">
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
              </button>}
      {isLoggedIn && (
        <>
      
          <button onClick={handleLogout} className="nav-item logout-btn">
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
        </>
      )}


          </div>

          {/* Mobile menu button */}
          <div className="mobile-menu-btn">
            <i className="fas fa-bars"></i>
          </div>
        </nav>

        {/* Main Content */}
        <main className="content">
          <Routes>
      <Route path="/" element={<Navigate to="/Home" />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Settings" element={<Settings />} />
      <Route path="/AddAdmin" element={<AddAdmin/>} />
      <Route path="/Chat" element={<Chat />} /> 
      <Route path="/AddProfile" element={<AddProfile />}  />
       <Route path="/user/:id" element={<UserDetails/>} />
       <Route path="/Edits" element={<Edits />} />
      <Route path="/Notifications" element={<Notifications setNotificationCount={setNotificationCount} />} />
          </Routes>
        </main>
      </div>
 
  );
}

export default App;
