import React, { useState, useCallback, useEffect } from "react";
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
  const data = await fetch(`http://localhost:3000${path}`, fetchOptions);
  if (data.status >= 400) {
    throw new Error("API error");
  }
  const json = await data.json();
  return json;
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("password");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogOut = useCallback(async () => {
    try {
      const data = await callApi({
        path: "/users/sign_out",
        method: "DELETE",
      });
      console.log(data);
    } catch {}
  }, []);

  const handleTest = useCallback(async () => {
    try {
      const data = await callApi({
        path: "/test",
        method: "POST",
      });
      console.log(data);
    } catch {}
  }, []);

  const login = useCallback(async (body) => {
    try {
      const data = await callApi({
        body,
        path: "/users/sign_in",
        method: "POST",
      });
      setAuthenticated(true);
      csrf = data.csrf_token;
    } catch {}
  }, []);

  const handleSubmit = useCallback(() => {
    login({ user: { email, password, remember_me: rememberMe } });
  }, [email, password, rememberMe]);

  const handleRequestReset = useCallback(async () => {
    try {
      const data = await callApi({
        body: { user: { email } },
        path: "/users/password",
        method: "POST",
      });
      console.log(data);
    } catch {}
  }, [email]);

  useEffect(() => {
    login({});
  }, []);

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
          <div>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            remember me
          </div>
          <button onClick={handleSubmit}>log in</button>
        </>
      )}
      <div>
        <button onClick={handleTest}>test API</button>
      </div>
      <div>
        <button onClick={handleLogOut}>log out</button>
      </div>

      <br />
      <br />

      request reset password email
      <div>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
        />
      </div>
      <div>
        <button onClick={handleRequestReset}>request password reset</button>
      </div>
    </div>
  );
}

export default App;
