import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import StoryDisplay from "./components/StoryDisplay";
import Auth from "./components/Auth";
import "./index.css";

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      // Verify token is still valid
      verifyToken(token, userData);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token, userData) => {
    try {
      const res = await fetch("http://localhost:5050/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Check if response is JSON before parsing
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setAccessToken(token);
          setUser(data.user || JSON.parse(userData));
        } else {
          // Not JSON response, clear storage
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
        }
      } else {
        // Token invalid, clear storage
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      // Only clear storage if it's an auth error, not a network error
      if (err.message && !err.message.includes("Failed to fetch")) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (token, userData) => {
    setAccessToken(token);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await fetch("http://localhost:5050/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setAccessToken(null);
      setUser(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <React.StrictMode>
      {accessToken && user ? (
        <StoryDisplay
          accessToken={accessToken}
          user={user}
          onLogout={handleLogout}
        />
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
