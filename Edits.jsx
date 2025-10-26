import React, { useState } from "react";
import "./AddProfile.css"
function Edits() {

  const [profileImage, setProfileImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get user ID from session storage
    const adminData = sessionStorage.getItem("admin");
    const admin = JSON.parse(adminData);
    const userId = admin.id;

    // Create form data
    const formData = new FormData();

    formData.append("profile_image", profileImage);

 
    const response = await fetch(`http://localhost:5000/Edits/${userId}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      alert("Profile updated successfully!");
      setEmail(""); 
      setProfileImage(null); // Clear file
    } else {
      alert("Error: " + result.error);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
   

      <input
        type="file"
        className="file"
        accept="image/*"
        onChange={(e) => setProfileImage(e.target.files[0])}
      />

      <button type="submit">Add Profile</button>
    </form>
  );
}

export default Edits;