import React, { useState, useCallback } from "react";
import "./App.css";

async function login(email, password) {
  const fetchOptions = {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  const data = await fetch("http://localhost:3000/", fetchOptions);
  if (data.status >= 400) {
    throw new Error("API error");
  }
  return data;
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  const handleSubmit = useCallback(async () => {
    try {
      await login(email, password);
      setAuthenticated(true);
    } catch {}
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (authenticated) {
    return (
      <div className="App">
        <div>You are authenticated!</div>
      </div>
    );
  }

  return (
    <div className="App">
      <div>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          type="email"
        />
      </div>
      <div>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
        />
      </div>
      <button onClick={handleSubmit}>log in</button>
    </div>
  );
}

export default App;
