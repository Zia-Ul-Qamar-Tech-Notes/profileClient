import { useState, useEffect } from "react";
import "tailwindcss";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken")
  );
  const [userData, setUserData] = useState(null);

  const url = "https://jwtauthserver.azurewebsites.net";
  // const url = "http://localhost:8000";

  useEffect(() => {
    const interval = setInterval(() => {
      if (refreshToken) {
        refreshAccessToken();
        setRefreshToken(localStorage.getItem("refreshToken"));
      }
    }, 20000); // Refresh every 20 Sec
    return () => clearInterval(interval);
  }, [refreshToken]);

  const handleRegister = async () => {
    const res = await fetch(`${url}/auth/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    alert(data);
  };

  const handleLogin = async () => {
    const res = await fetch(`${url}/auth/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.accessToken && data.refreshToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      alert("Login Successful");
    } else {
      alert("Invalid Credentials");
    }
  };

  const refreshAccessToken = async () => {
    console.log("Refreshing Access Token...");

    const refreshToken = localStorage.getItem("refreshToken");

    // If refresh token is missing, logout immediately
    if (!refreshToken) {
      alert("Session Expired, Please Login Again");
      logout();
      return;
    }

    try {
      const res = await fetch(`${url}/refresh/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await res.json();

      // If the response status is 401 or refresh token is invalid, log out the user immediately
      if (!res.ok || !data.accessToken) {
        console.error("Invalid or Expired Refresh Token:", data);
        alert("Session Expired, Please Login Again");
        logout();
        return;
      }

      // If accessToken is received, update local storage
      localStorage.setItem("accessToken", data.accessToken);
      setAccessToken(data.accessToken);
    } catch (error) {
      console.error("Error refreshing access token:", error);
      alert("Session Expired, Please Login Again");
      logout();
    }
  };

  const fetchTodos = async () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");

    // If refreshToken is manually deleted or modified, log out
    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      alert("Session Expired. Please login again.");
      // setUserData(null);
      return logout();
    }
    localStorage.setItem("accessToken", accessToken);
    if (!accessToken) return alert("Please login first");
    const res = await fetch(`${url}/todos`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    setUserData(data);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    setRefreshToken(null);
    setUserData(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Auth App
        </h2>
        {!accessToken ? (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-between">
              <button
                onClick={handleRegister}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md mr-2"
              >
                Register
              </button>
              <button
                onClick={handleLogin}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md ml-2"
              >
                Login
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={fetchTodos}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-md mb-4"
            >
              Fetch Todos
            </button>
            <button
              onClick={logout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md"
            >
              Logout
            </button>
          </>
        )}
        {userData && (
          <pre className="mt-4 bg-gray-200 p-4 rounded-md overflow-auto">
            {JSON.stringify(userData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default App;
