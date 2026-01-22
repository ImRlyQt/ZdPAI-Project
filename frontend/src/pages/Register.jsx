import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api";
import "../styles/auth.scss";
import "../styles/globals.scss";

export default function Register(){
  const [nick, setNick] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e){
    e.preventDefault();
    setError("");
    if (!nick || !dob || !email || !password) { setError("Please fill all fields."); return; }
    const res = await apiPost("/auth/register", null, { nick, dob, email, password });
    if (!res.ok) {
      if (res.status === 409) setError("Email already registered.");
      else setError("Registration error.");
      return;
    }
    navigate("/login?registered=1");
  }

  return (
    <main className="auth-main auth-bg">
      <h1 className="logo">DeckHeaven</h1>
      <div className="wrapper">
        <div className="container">
          <h2>Register</h2>
          <p>Sign up to enjoy the feature of Revolutie</p>
          {error && <p className="auth-msg error">{error}</p>}
          <form onSubmit={onSubmit}>
            <input className="login-input" type="text" value={nick} onChange={e=>setNick(e.target.value)} placeholder="Nick" required />
            <input className="login-input" type="date" value={dob} onChange={e=>setDob(e.target.value)} placeholder="Date of birth" required />
            <input className="login-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
            <div className="password-wrapper">
              <input className="login-input" type="password" id="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required />
              <i className="fa fa-eye toggle-password" onClick={()=>{
                const el = document.getElementById("password");
                el.type = el.type === "password" ? "text" : "password";
              }} aria-hidden="true"></i>
            </div>
            <button type="submit">Register</button>
          </form>
          <div className="register">
            Already have an account? <a href="/login">Sign in</a>
          </div>
        </div>
        <div className="underglow-container">
          <img className="auth-illustration" src="/assets/cards/brakSkolima.svg" />
        </div>
      </div>
      <div className="underglow"></div>
    </main>
  );
}
