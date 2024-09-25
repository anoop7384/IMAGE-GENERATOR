// src/components/EditProfile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function EditProfile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current profile info
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:9000/profile");
        setName(response.data.name);
        setEmail(response.data.email);
      } catch (error) {
        console.error("Error fetching profile", error);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      await axios.put("http://localhost:9000/profile", { name, email });
      if (profilePicture) {
        const formData = new FormData();
        formData.append("file", profilePicture);
        await axios.put(
          "http://localhost:9000/profile/profile-picture",
          formData
        );
      }
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleProfileUpdate}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Profile Picture:</label>
          <input
            type="file"
            onChange={(e) => setProfilePicture(e.target.files[0])}
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}

export default EditProfile;
