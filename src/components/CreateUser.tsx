import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "../firebase-config";
import "./CreateUser.css";

function CreateUser() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const read: Array<string> = [];
  const wish: Array<string> = [];
  const verified: boolean = false;
  const admin: boolean = false;


  function clearFields() {
    setName("");
    setEmail("");
    setPassword("");
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (name !== "" && email !== "" && password !== "") {
      createUserWithEmailAndPassword(auth, email, password)
        .then(async (data) => {
          // setUserId(data.user.uid); Denne gjorde at bruker ble lagt til i Authentication lista i Firebase, men ikke i db.
          try {
            await setDoc(doc(db, "users", data.user.uid), {
              name,
              email,
              admin,
              read,
              wish,
              verified
            });
            //clear textfields after pressing OK
            clearFields();
            alert("Brukeren har blitt opprettet");
            navigate("/login");
          } catch (e) {
            console.error("Error oppstod: ", e);
          }
        })
        .catch((error) => {
          alert(error.message);
          //clear textfields after pressing OK
          clearFields();
        });
    } else {
      alert("Fyll ut alle felt!");
    }
  };
  return (
    <form className="CreateUser" onSubmit={handleSubmit}>
      <input
        type="name"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Navn"
      />
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Passord"
      />
      <button type="submit">Opprett bruker</button>
    </form>
  );
}
export default CreateUser;
