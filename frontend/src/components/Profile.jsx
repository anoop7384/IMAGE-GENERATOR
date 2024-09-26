import { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css"; // Updated CSS for a more aesthetic design



const downloadImage = (fileURL) => {
  fetch(fileURL, {
    method: "GET",
    headers: {
      "Content-Type": "image/jpeg", // Adjust according to the image type you are dealing with
    },
  })
    .then((response) => response.blob())
    .then((blob) => {
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "downloadedImage.jpg"); // Set the default filename for the download

      // Append to html link element page
      document.body.appendChild(link);

      // Start download
      link.click();

      // Clean up and remove the link
      link.parentNode.removeChild(link);
    })
    .catch((error) =>
      console.error("There was an error downloading the image:", error)
    );
};

const shareOnFacebook = (url) => {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    url
  )}`;
  window.open(facebookUrl, "_blank");
};

const shareOnWhatsApp = (url) => {
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    url
  )}`;
  window.open(whatsappUrl, "_blank");
};

const shareOnTwitter = (url) => {
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    url
  )}&text=${encodeURIComponent("Check out this amazing image!")}`;
  window.open(twitterUrl, "_blank");
};

const copyUrlToClipboard = async (url) => {
  try {
    await navigator.clipboard.writeText(url);
    alert("URL copied to clipboard!");
  } catch (err) {
    alert("Failed to copy URL: ", err);
  }
};




function Profile() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [lightboxDisplay, setLightboxDisplay] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [currentImageID, setCurrentImageID] = useState("");

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

  const openLightbox = (url, id) => {
    setCurrentImage(url);
    setLightboxDisplay(true);
    setCurrentImageID(id);
  };

  const closeLightbox = () => {
    setLightboxDisplay(false);
  };

  const removeImage = async (imageId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized: No token found");
    }
    try {
      const response = await axios.delete(
        `http://localhost:9000/api/profile/${imageId}/removeImage`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Image removed successfully");
        alert("Image removed successfully!");

        // Update the state by removing the image from savedImages
        setUserData((prevData) => ({
          ...prevData,
          savedImages: prevData.savedImages.filter(
            (image) => image.public_id !== imageId
          ),
        }));
      }
    } catch (error) {
      console.error("Error removing image:", error);
      alert("Failed to remove the image. Please try again.");
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  if (!userData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-container" style={{marginTop : "50px"}}>
      <div className="profile-content">
        <h1>{userData.name}'s Profile</h1>
        <p>Email: {userData.email}</p>
        <h2>Saved Images</h2>
        {userData.savedImages.length > 0 ? (
          <div className="saved-images-grid">
            {userData.savedImages.map((image) => (
              <div
                key={image._id}
                className="image-item"
                onClick={() => openLightbox(image.url, image.public_id)}
              >
                <img src={image.url} alt={image.prompt} />
                <p>{image.prompt}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No saved images</p>
        )}
      </div>

      {lightboxDisplay && (
        <div className="lightbox">
          <div className="lightbox-controls">
            <span className="close-btn" onClick={closeLightbox}>
              &times;
            </span>
            <button
              className="download-btn"
              onClick={() => downloadImage(currentImage)}
              title="Download Image"
            >
              Download
            </button>
            <button
              className="download-btn"
              onClick={() => removeImage(currentImageID)}
              title="Remove Image"
            >
              Remove {/* Save Icon */}
            </button>
            <button
              className="download-btn"
              onClick={() => shareOnFacebook(currentImage)}
              title="Share on Facebook"
            >
              <i className="fab fa-facebook-f"></i>
            </button>
            <button
              className="download-btn"
              onClick={() => shareOnWhatsApp(currentImage)}
              title="Share on WhatsApp"
            >
              <i className="fab fa-whatsapp"></i>
            </button>
            <button
              className="download-btn"
              onClick={() => shareOnTwitter(currentImage)}
              title="Share on Twitter"
            >
              <i className="fab fa-twitter"></i>
            </button>
            <button
              className="download-btn"
              onClick={() => copyUrlToClipboard(currentImage)}
              title="Copy URL to Clipboard"
            >
              <i className="fas fa-copy"></i>
            </button>
          </div>
          <img
            className="lightbox-image"
            src={currentImage}
            alt="Saved Artwork"
          />
        </div>
      )}
    </div>
  );
}

export default Profile;
