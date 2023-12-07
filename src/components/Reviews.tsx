import { Button } from "@mui/material"
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, DocumentData, where, doc, deleteDoc } from "firebase/firestore";

import { db } from "../firebase-config";
import isAdmin from "../utils/admin";
import '../schemas/Review.ts';
import './Reviews.css'

export default function Reviews(isbn: any) {
  const currentBook = isbn.isbn;

  //our table will display whatever data is in 'rows'
  const [rows, setRows] = useState<DocumentData[]>([]);
  const [admin, setAdmin] = useState(false);


  //getBooks functions to attach a listener and fetch book data
  const getReviews = () => {
    const q = query(collection(db, "reviews"), where("book", "==", currentBook));
    onSnapshot(q, (querySnapshot) => {
      const rows: DocumentData[] = [];
      querySnapshot.forEach(async (doc) => {
        rows.push({ ...doc.data(), id: doc.id })
      });
      setRows(rows);
    });
  };


  function showDeleteReview(reviewID: string) {
    if (admin) {
      return (
        <Button color="warning" variant="outlined" onClick={() => deleteReview(reviewID)}> Delete </Button>
      )
    }
  }

  const deleteReview = async (id: string) => {
    await deleteDoc(doc(db, "reviews", id));
  }

  //call getBooks when app is loaded
  useEffect(() => {
    getReviews();
    isAdmin().then((isAdmin) => {
      setAdmin(isAdmin);
    })
  }, [isbn]);

  return (
    <div>
      {rows.map((rows, index) => (
        <div key={rows.id} className="reviewcomponent" >
          <h2 className="rating">{rows.rating}/6</h2>
          <div className="reviewinfo">
            <div className="userinfo">
              <p style={{ textAlign: 'left' }}> {rows.published.toDate().toLocaleDateString()} </p>
              <p style={{ textAlign: 'right' }}> Skrevet av {rows.username}</p>
            </div>
            <h3>{rows.text}</h3>
            {showDeleteReview(rows.id)}
          </div>
        </div>
      ))}
    </div>
  );
};
