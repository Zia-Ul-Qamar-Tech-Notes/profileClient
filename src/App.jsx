import { useState, useEffect } from "react";

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (refreshToken) {
        refreshAccessToken();
      }
    }, 20000); // Refresh every 2 minutes
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
    const res = await fetch(`${url}/refresh/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      setAccessToken(data.accessToken);
    } else {
      alert("Session Expired, Please Login Again");
      logout();
    }
  };

  const fetchTodos = async () => {
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
    <div className="App">
      <h2>Auth App</h2>
      {!accessToken ? (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleRegister}>Register</button>
          <button onClick={handleLogin}>Login</button>
        </>
      ) : (
        <>
          <button onClick={fetchTodos}>Fetch Todos</button>
          <button onClick={logout}>Logout</button>
        </>
      )}
      {userData && <pre>{JSON.stringify(userData, null, 2)}</pre>}
    </div>
  );
}

export default App;
