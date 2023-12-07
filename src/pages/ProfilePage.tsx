import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import isAdmin from '../utils/admin'
import Logout from "../components/Logout";
import './ProfilePage.css'
import ReadBooks from "../components/ReadBooks";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase-config";
import WishList from "../components/WishList";
import { doc, getDoc } from "firebase/firestore";

function ProfilePage() {
  const [admin, setAdmin] = useState(false);
  const [userId, setUserId] = useState('0');

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      setUserId(user.uid);
    }
  });

  const navigate = useNavigate();

  const onAddBookClick = () => {
    navigate("/add-book");
  }

  const onAddAuthorClick = () => {
    navigate("/add-author");
  }

  useEffect(() => {
    isAdmin().then((isAdmin) => {
      setAdmin(isAdmin);
    });
  }, []);

  return (
    <div>
      <h1>Brukerside</h1>
      {
        admin && (
          <div className="parent-container">
            <div className="button-container">
              <button onClick={onAddAuthorClick} className="add-button">
                <span className="button-text">Legg til forfatter</span>
                <img src='./person_add.png' alt='Add author' className="button-icon" />
              </button>
              <button onClick={onAddBookClick} className="add-button">
                <span className="button-text">Legg til bok</span>
                <img src='./library_add.png' alt='Add book' className="button-icon" />
              </button>
            </div>
          </div>
        )
      }
      <Logout />
      <div className="wrapper">
        {userId && <ReadBooks userId={userId} />}
        {userId && <WishList userId={userId}/>}
      </div>
    </div>
  );

}

export default ProfilePage;