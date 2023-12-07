import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase-config";
import "./Logout.css";

function Logout() {

    const navigate = useNavigate();
    const handleLogout = () => {
        signOut(auth).then( () => {
          alert("Logged out");
          navigate('/');
        })
    };

    return (
        <button type="submit" onClick={handleLogout}>Logg ut</button>
    )
}

export default Logout;

