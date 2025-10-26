import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import "./Register.css";
import e from "cors";

const Register = () => {
  const [name, setName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [date_of_birth, setDate_of_birth] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

const [visitedKidName, setVisitedKidName] = useState("");
const [visitedKidGrade, setVisitedKidGrade] = useState("");
const [visitedKidFamily, setVisitedKidFamily] = useState("");
const [visitedKidMother, setVisitedKidMother] = useState("");

const [alumniTime, setAlumniTime] = useState("");
const [alumniMeetingPerson, setAlumniMeetingPerson] = useState("");

const [visitorOrigin, setVisitorOrigin] = useState("");
const [visitorTitle, setVisitorTitle] = useState("");

const [groupLead, setGroupLead] = useState("");
const [groupNumber, setGroupNumber] = useState("");
const [groupTime, setGroupTime] = useState("");

  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate= useNavigate();
   useEffect(() => {
  const adminData = sessionStorage.getItem("admin");

  if (!adminData) {
    navigate("/Login");
  } 
  else {
    const admin = JSON.parse(adminData);
    if (admin.role === "super-admin") {
      navigate("/Dashboard"); 
    }
  }
}, [navigate]);


  
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);



  if (!name || !nationalId || !role || !gender || !date_of_birth || !status || !reason) {
    setMessage("Please fill all required fields.");
    setSuccess(false);
    setIsLoading(false);
    return;
  }

 
  if (nationalId.length !== 16 || !/^\d+$/.test(nationalId)) {
    setMessage("ID must be exactly 16 digits.");
    setSuccess(false);
    setIsLoading(false);
    return;
  }


  if (role === "Parent") {
    if (!visitedKidName || !visitedKidGrade || !visitedKidFamily || !visitedKidMother) {
      setMessage("Please fill all Parent-specific fields.");
      setSuccess(false);
      setIsLoading(false);
      return;
    }
  } else if (role === "Alumni") {
    if (!alumniTime || !alumniMeetingPerson) {
      setMessage("Please fill all Alumni-specific fields.");
      setSuccess(false);
      setIsLoading(false);
      return;
    }
  } else if (role === "Visitor") {
    if (!visitorOrigin || !visitorTitle) {
      setMessage("Please fill all Visitor-specific fields.");
      setSuccess(false);
      setIsLoading(false);
      return;
    }
  } else if (role === "Group") {
    if (!groupLead || !groupNumber || !groupTime) {
      setMessage("Please fill all Group-specific fields.");
      setSuccess(false);
      setIsLoading(false);
      return;
    }
  }

  const payload = {
    name,
    nationalId,
    role,
    status,
    gender,
    date_of_birth,
    reason,
    visitedKidName,
    visitedKidGrade,
    visitedKidFamily,
    visitedKidMother,
    alumniTime,
    alumniMeetingPerson,
    visitorOrigin,
    visitorTitle,
  
    groupLead,
    groupNumber,
    groupTime,
  };

  try {
    const response = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(data.message);
      setSuccess(true);
      // reset all fields
      setName("");
      setNationalId("");
      setRole("");
      setStatus("");
      setGender("");
      setDate_of_birth("");
      setReason("");
      setVisitedKidName("");
      setVisitedKidGrade("");
      setVisitedKidFamily("");
      setVisitedKidMother("");
      setAlumniTime("");
      setAlumniMeetingPerson("");
      setVisitorOrigin("");
      setVisitorTitle("");
   
      setGroupLead("");
      setGroupNumber("");
      setGroupTime("");
    } else {
      setMessage(data.message || "Registration failed");
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
          <img src="/logo.svg" alt="Registration" />
        </div>

        <div className="form-container">
          <h2>Register Person</h2>
          <p className="subtitle">UZUZA FORM</p>

          {message && (
            <div className={`message ${success ? "success" : "error"}`}>
              <span className="icon">{success ? "✓" : "!"}</span>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Full Name/Amazina yose</label>
              <input
                id="name"
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="national_id">16-digit ID/Indangamuntu</label>
              <input
                id="national_id"
                type="text"
                placeholder="Enter 16-digit ID"
                value={nationalId}
                onChange={(e) =>
                  setNationalId(e.target.value.replace(/\D/g, "").slice(0, 16))
                }
                maxLength="16"
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="role">Role/Urinde</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select Role</option>

                <option value="Student">Student</option>
                <option value="Parent">Parent</option>
                <option value="Visitor">Visitor</option>
                <option value="Group">Group-Visitor</option>
                <option value="Alumni">Alumni</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

   {role === "Parent" && (
    <div className="input-group">

    <input placeholder="Kid Name" value={visitedKidName}  onChange={(e)=>setVisitedKidName(e.target.value)} />
    <input placeholder="Grade" value={visitedKidGrade} onChange={(e)=>setVisitedKidGrade(e.target.value)} />
    <input placeholder="Family Name" value={visitedKidFamily} onChange={(e)=>setVisitedKidFamily(e.target.value)} />
    <input placeholder="Mother Name" value={visitedKidMother} onChange={(e)=>setVisitedKidMother(e.target.value)} />

  </div>

)}

{role === "Alumni" && (
  <div className="input-group">
    <input placeholder="Time" value={alumniTime} onChange={(e)=>setAlumniTime(e.target.value)} />
    <input placeholder="Meeting Person" value={alumniMeetingPerson} onChange={(e)=>setAlumniMeetingPerson(e.target.value)} />
 </div>
)}

{role === "Visitor" && (
  <div className="input-group">
    <input placeholder="Origin" value={visitorOrigin} onChange={(e)=>setVisitorOrigin(e.target.value)} />
    <input placeholder="Title" value={visitorTitle} onChange={(e)=>setVisitorTitle(e.target.value)} />
 
  </div>
)}

{role === "Group" && (
  <div className="input-group">
    <input placeholder="Team Lead" value={groupLead} onChange={(e)=>setGroupLead(e.target.value)} />
    <input placeholder="Number of people" value={groupNumber} onChange={(e)=>setGroupNumber(e.target.value)} />
    <input placeholder="Time" value={groupTime} onChange={(e)=>setGroupTime(e.target.value)} />
</div>
)}

            <div className="input-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="dob">Date of Birth</label>
              <input
                id="date_of_birth"
                type="date"
                value={date_of_birth}
                onChange={(e) => setDate_of_birth(e.target.value)}

                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select Status</option>
                <option value="Inside">Entering/Kwinjira</option>
                <option value="Left">Leaving/GUSOHOKA</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="reason">Reason</label>
              <textarea
                id="reason"
                placeholder="Enter the reason for entry/exit or visit"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
