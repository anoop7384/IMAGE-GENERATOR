import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "./Images.css";

const fetchImagesAPI = async () => {
  const token = localStorage.getItem("token"); // Get the token from localStorage
  if (!token) {
    throw new Error("Unauthorized: No token found");
  }

  const res = await axios.get("http://localhost:9000/images", {
    headers: {
      Authorization: `${token}`, // Include the token in the Authorization header
    },
  });
  return res.data;
};

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

const saveImage = async (imageId) => {
  const token = localStorage.getItem("token"); // Get the token from localStorage
  if (!token) {
    throw new Error("Unauthorized: No token found");
  }
  console.log(imageId);
  try {
    const response = await axios.post(
      `http://localhost:9000/api/profile/${imageId}/saveImage`,
      {
        headers: {
          Authorization: `${token}`, // Include the token in the Authorization header
        },
      }
    );

    if (response.status === 200) {
      console.log("Image saved successfully");
      alert("Image saved successfully!");
    }
  } catch (error) {
    console.error("Error saving image:", error);
    alert("Failed to save the image. Please try again.");
  }
};

export default function Gallery() {
  const { data } = useQuery({
    queryKey: ["images"],
    queryFn: fetchImagesAPI,
  });
  const [lightboxDisplay, setLightboxDisplay] = React.useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [currentImageID, setCurrentImageID] = useState("");

  const openLightbox = (url, id) => {
    setCurrentImage(url);
    setLightboxDisplay(true);
    setCurrentImageID(id);
  };

  const closeLightbox = () => {
    setLightboxDisplay(false);
  };

  // Assign a class to each image based on its index or other criteria
  const getImageClass = (index) => {
    // Define patterns for different image sizes
    // For example, first image is large, second is medium, etc.
    const pattern = ["large", "medium", "small"];
    return `image-container ${pattern[index % pattern.length]}`;
  };

  return (
    <>
      <div className="gallery">
        {data?.map((image, index) => (
          <div
            key={index}
            className={`image-container image-${index + 1}`}
            onClick={() => openLightbox(image.url, image.public_id)}
          >
            <img
              src={image.url}
              alt={`Artwork ${index + 1}`}
              className="gallery-image"
            />
          </div>
        ))}
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
              title="Download Image" // Hover text
            >
              Download
            </button>
            <button
              className="download-btn"
              onClick={() => saveImage(currentImageID)} // Replace this with your save function
              title="Save Image" // Hover text
            >
              Save {/* Save Icon */}
            </button>
            <button
              className="download-btn"
              onClick={() => shareOnFacebook(currentImage)}
              title="Share on Facebook" // Hover text
            >
              <i className="fab fa-facebook-f"></i>
            </button>
            <button
              className="download-btn"
              onClick={() => shareOnWhatsApp(currentImage)}
              title="Share on WhatsApp" // Hover text
            >
              <i className="fab fa-whatsapp"></i>
            </button>
            <button
              className="download-btn"
              onClick={() => shareOnTwitter(currentImage)}
              title="Share on Twitter" // Hover text
            >
              <i className="fab fa-twitter"></i>
            </button>
            <button
              className="download-btn"
              onClick={() => copyUrlToClipboard(currentImage)}
              title="Copy URL to Clipboard" // Hover text
            >
              <i className="fas fa-copy"></i>
            </button>
          </div>
          <img className="lightbox-image" src={currentImage} alt="Artwork" />
        </div>
      )}
    </>
  );
}
