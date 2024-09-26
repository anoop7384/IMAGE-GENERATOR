// src/components/Auth.jsx
import { useState } from "react";
import axios from "axios";
import "./Auth.css"; // Import the CSS file for styling

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState(""); // Add state for DOB
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const url = isLogin
      ? "http://localhost:9000/auth/login"
      : "http://localhost:9000/auth/register";
    const payload = isLogin
      ? { email, password }
      : { name, email, password, dob }; // Include DOB in registration payload

    try {
      const response = await axios.post(url, payload);

      const { token } = response.data;
      console.log(token);

      // Save JWT token to localStorage
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      onAuthSuccess(); // Notify parent component (App) that user is authenticated
    } catch (error) {
      setError(error.response ? error.response.data.message : "Error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="input-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your name"
                />
              </div>
              <div className="input-group">
                <label>Date of Birth:</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  placeholder="Enter your date of birth"
                />
              </div>
            </>
          )}
          <div className="input-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="input-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="auth-btn">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="switch-btn">
          {isLogin ? "Switch to Register" : "Switch to Login"}
        </button>
      </div>
    </div>
  );
}

export default Auth;
