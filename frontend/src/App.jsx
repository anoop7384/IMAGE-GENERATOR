import { useState, useEffect } from "react";
import Images from "./components/Images";
import GenerateImage from "./components/GenerateImage";
import Auth from "./components/Auth";
import Profile from "./components/Profile"; // Import Profile component
import EditProfile from "./components/EditProfile"; // Import EditProfile component
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("generate"); // default page is GenerateImage

  // Check if user is already authenticated (JWT token exists)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `${token}`;
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
    setCurrentPage("generate"); // Redirect to generate page after logout
  };

  // Function to render the current page component
  const renderPage = () => {
    switch (currentPage) {
      case "generate":
        return (
          <>
            <GenerateImage />
            <Images />
          </>
        );
      case "profile":
        return <Profile />;
      case "edit-profile":
        return <EditProfile />;
      default:
        return (
          <>
            <GenerateImage />
            <Images />
          </>
        );
    }
  };

  return (
    <>
      {!isAuthenticated ? (
        <Auth onAuthSuccess={handleAuthSuccess} />
      ) : (
        <>
          <nav
            className="navigation-menu"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end", // Aligns the nav to the right
              alignItems: "center", // Vertically center the items
              position: "fixed", // Keep it at the top-right corner
              top: "10px",
              right: "20px",
              backgroundColor: "#f8f9fa", // Light background color for contrast
              padding: "10px 20px", // Add padding around the nav
              borderRadius: "8px", // Rounded corners for a modern look
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
            }}
          >
            <ul
              className="nav-list"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px", // Add space between buttons
                listStyleType: "none",
                margin: 0, // Remove default margin
                padding: 0, // Remove default padding
              }}
            >
              <li>
                <button
                  onClick={() => setCurrentPage("generate")}
                  style={{
                    backgroundColor: "#007bff", // Blue color for buttons
                    color: "#fff", // White text
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("profile")}
                  style={{
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Profile
                </button>
              </li>

              {currentPage === "profile" && (
                <>
                  <li>
                    <button
                      onClick={handleLogout}
                      style={{
                        backgroundColor: "#dc3545", // Red color for logout button
                        color: "#fff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* Render the current page based on the state */}
          <div>{renderPage()}</div>
        </>
      )}
    </>
  );
}

export default App;
