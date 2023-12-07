import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase-config";

/**
Returns true if the user logged in is an admin, false otherwise. 
**/
export default function isAdmin(): Promise<boolean> {
  return new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData && userData.admin) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  });
}



