import React, { useRef, useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";
import { useNavigate } from 'react-router-dom';
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("Logged in successfully!");
        navigate('/profile');
      })
      .catch(error => {
        alert(error.message);
      });
  };

  return (
  
    <form className="login-form" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Epost"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Passord"
      />
      <button type="submit">Logg inn</button>
    </form>
  );
}

export default Login;