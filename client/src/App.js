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

  const [newPassword, setNewPassword] = useState("");
  const [resetPasswordToken, setResetPasswordToken] = useState("");

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

  useEffect(() => {
    login({});
  }, []);

  // reset
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

  const handleUpdatePassword = useCallback(async () => {
    try {
      const data = await callApi({
        body: {
          user: {
            password: newPassword,
            password_confirmation: newPassword,
            reset_password_token: resetPasswordToken,
          },
        },
        path: "/users/password",
        method: "PUT",
      });
      console.log(data);
    } catch {}
  }, [newPassword, resetPasswordToken]);

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

      <br />
      <br />

      reset password
      <div>
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="new password"
          type="password"
        />
      </div>
      <div>
        <input
          value={resetPasswordToken}
          onChange={(e) => setResetPasswordToken(e.target.value)}
          placeholder="reset password token"
        />
      </div>
      <div>
        <button onClick={handleUpdatePassword}>update password</button>
      </div>
    </div>
  );
}

export default App;
