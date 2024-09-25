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
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
          {/* Navigation Menu */}
          <nav>
            <ul>
              <li>
                <button onClick={() => setCurrentPage("generate")}>Home</button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("profile")}>
                  Profile
                </button>
              </li>

              {/* Only show Edit Profile and Logout on the Profile page */}
              {currentPage === "profile" && (
                <>
                  <li>
                    <button onClick={() => setCurrentPage("edit-profile")}>
                      Edit Profile
                    </button>
                  </li>
                  <li>
                    <button onClick={handleLogout}>Logout</button>
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
