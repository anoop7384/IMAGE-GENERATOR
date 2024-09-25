// src/components/Profile.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css"; // CSS file for styling the profile

function Profile() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in.");
          return;
        }

        const response = await axios.get("http://localhost:9000/api/profile", {
          headers: {
            Authorization: `${token}`,
          },
        });

        setUserData(response.data);
      } catch (error) {
        setError("Error fetching profile data");
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!userData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-container">
      <h1>{userData.name}'s Profile</h1>
      <p>Email: {userData.email}</p>

      <h2>Saved Images</h2>
      {userData.savedImages.length > 0 ? (
        <div className="saved-images-grid">
          {userData.savedImages.map((image) => (
            <div key={image._id} className="image-item">
              <img src={image.url} alt={image.prompt} />
              <p>{image.prompt}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No saved images</p>
      )}
    </div>
  );
}

export default Profile;
