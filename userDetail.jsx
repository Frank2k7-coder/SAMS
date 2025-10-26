import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./UserDetails.css";

function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setError("");
    
    console.log(`Fetching user with ID: ${id}`);
    
    fetch(`http://localhost:5000/users/${id}`)
      .then(async (res) => {
        console.log(`Response status: ${res.status}`);
        
        if (!res.ok) {
          try {
            const errorData = await res.json();
            throw new Error(errorData.error || `HTTP ${res.status}: User not found`);
          } catch (e) {
            throw new Error(`HTTP ${res.status}: Failed to fetch user`);
          }
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ User data received:", data);

        if (Array.isArray(data)) {
          if (data.length === 0) {
            throw new Error("User not found");
          }
          setUser(data[0]); 
        } else {
          setUser(data);
        }
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
        setError(err.message);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return <p className="loading-message">Loading...</p>;
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  if (!user) {
    return <p className="error-message">User not found</p>;
  }

  return (
    <div className="user-details-container">
      <h2>{user.name}'s Information</h2>
      
      <p><strong>National ID:</strong> {user.national_id}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Status:</strong> {user.status}</p>
      <p><strong>Date Registered:</strong> {user.created_at}</p>
      <p><strong>Gender:</strong> {user.gender}</p>
      <p><strong>Date of Birth:</strong> {user.date_of_birth}</p>
      <p><strong>Reason:</strong> {user.reason}</p>

      {/* Role-specific sections remain the same */}
      {user.role === "Parent" && (
        <div className="role-section">
          <h3>Parent Details</h3>
          <p><strong>Child Name:</strong> {user.visited_kid_name}</p>
          <p><strong>Child Family:</strong> {user.visited_kid_family}</p>
          <p><strong>Child Grade:</strong> {user.visited_kid_grade}</p>
          <p><strong>Child Mother:</strong> {user.visited_kid_mother}</p>
        </div>
      )}

      {user.role === "Alumni" && (
        <div className="role-section">
          <h3>Alumni Details</h3>
          <p><strong>Time:</strong> {user.alumni_time}</p>
          <p><strong>Meeting Person:</strong> {user.alumni_meeting_person}</p>
        </div>
      )}

      {user.role === "Visitor" && (
        <div className="role-section">
          <h3>Visitor Details</h3>
          <p><strong>Origin:</strong> {user.visitor_origin}</p>
          <p><strong>Title:</strong> {user.visitor_title}</p>
        </div>
      )}

      {user.role === "Group" && (
        <div className="role-section">
          <h3>Group Details</h3>
          <p><strong>Group Leader:</strong> {user.group_lead}</p>
          <p><strong>Group Number:</strong> {user.group_number}</p>
          <p><strong>Time:</strong> {user.group_time}</p>
        </div>
      )}
    </div>
  );
}

export default UserDetails;