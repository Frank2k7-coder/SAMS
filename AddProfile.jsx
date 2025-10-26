import React, { useState } from "react";
import "./AddProfile.css"
function AddProfile() {
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get user ID from session storage
    const adminData = sessionStorage.getItem("admin");
    const admin = JSON.parse(adminData);
    const userId = admin.id;


    // Create form data
    const formData = new FormData();
    formData.append("email", email);
    formData.append("profile_image", profileImage);

 
    const response = await fetch(`http://localhost:5000/AddProfile/${userId}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      alert("Profile created successfully!");
      setEmail(""); 
      setProfileImage(null); 
    } 
    else {
      alert("Error: " + result.error);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        className="email"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

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

export default AddProfile;