import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiPost } from "../api";
import "../styles/auth.scss";
import "../styles/globals.scss";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill all fields."); return; }
    const res = await apiPost("/auth/login", null, { email, password });
    if (!res.ok) { setError("Invalid email or password."); return; }
    const data = await res.json();
    setToken(data.access_token);
    setUser(data.user);
    navigate("/profile");
  }

  return (
    <main className="auth-main auth-bg">
      <h1 className="logo">DeckHeaven</h1>
      <div className="wrapper">
        <div className="container">
          <h2>Sign in</h2>
          <p>Please login to continue to your account.</p>
          {error && <p className="auth-msg error">{error}</p>}
          <form onSubmit={onSubmit}>
            <input className="login-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
            <div className="password-wrapper">
              <input type="password" id="password" className="login-input" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required />
              <i className="fa fa-eye toggle-password" onClick={()=>{
                const el = document.getElementById("password");
                el.type = el.type === "password" ? "text" : "password";
              }} aria-hidden="true"></i>
            </div>
            <div className="checkbox">
              <input type="checkbox" id="keep" />
              <label htmlFor="keep">Keep me logged in</label>
            </div>
            <button type="submit">Sign in</button>
          </form>
          <div className="register">
            Don’t have an account? <a href="/register">Register</a>
          </div>
        </div>
        <div className="underglow-container">
          <img className="auth-illustration" src="/assets/cards/skolim.svg" />
        </div>
      </div>
      <div className="underglow"></div>
    </main>
  );
}
