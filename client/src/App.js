import React, { useState, useCallback } from "react";
import "./App.css";

let csrf = "";

async function callApi({ path, body, method }) {
  const fetchOptions = {
    method,
    body: JSON.stringify(body),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf,
    },
    credentials: "include",
  };
  const data = await fetch(`http://localhost:3000/${path}`, fetchOptions);
  if (data.status >= 400) {
    throw new Error("API error");
  }
  const json = await data.json();
  return json;
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  const handleLogOut = useCallback(async () => {
    try {
      const data = await callApi({
        path: "/users/sign_out",
        method: "DELETE",
      });
      console.log(data);
    } catch {}
  });

  const handleSession = useCallback(async () => {
    try {
      const data = await callApi({
        path: "/csrf",
        method: "GET",
      });
      csrf = data.csrf;
    } catch {}
  });

  const handleTest = useCallback(async () => {
    try {
      const data = await callApi({
        path: "/test",
        method: "POST",
      });
      console.log(data);
    } catch {}
  });

  const handleSubmit = useCallback(async () => {
    try {
      await callApi({
        body: { email, password },
        path: "/users/sign_in",
        method: "POST",
      });
      setAuthenticated(true);
    } catch {}
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="App">
      {authenticated ? (
        <div className="App">
          <div>You are authenticated!</div>
        </div>
      ) : (
        <>
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
        </>
      )}
      <div>
        <button onClick={handleTest}>test API</button>
      </div>
      <div>
        <button onClick={handleSession}>get session</button>
      </div>
      <div>
        <button onClick={handleLogOut}>log out</button>
      </div>
    </div>
  );
}

export default App;
