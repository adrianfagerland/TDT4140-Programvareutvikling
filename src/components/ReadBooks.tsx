import { CollectionReference, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { collection } from "firebase/firestore";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase-config";
import { Book } from "../schemas/Book";

interface Props {
  userId: string;
}


// HER


function ReadBooks(props: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const navigate = useNavigate();
  const onTableCellClick = (documentID: string) => {
    navigate(`/book/${documentID}`);
  };

  useEffect(() => {
    async function getBooks() {
      const userDocRef = doc(db, "users", props.userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data() ?? {};
      const booksRef = collection(db, "books") as CollectionReference<Book>;
      const booksSnapshot = await getDocs<Book>(booksRef);

      let booksData = booksSnapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, any>;
        data["documentID"] = doc.id;
        return data as Book;
      });

      const readBooks = userData.read || [];
      const filteredBooks = booksData.filter((book) => {
        return readBooks.includes(book.documentID);
      });
      setBooks(filteredBooks);

    }

    getBooks();
  }, [props.userId]);


  return (
    /* { <div className="read-books">
       <h2>Leste bøker</h2>
       <ul>
         {books.map((book) => (
           <li key={book.documentID}>
             <a href={`/book/${book.documentID}`}>
             {book.title}, {book.authors?.join(", ")}
           </a>
           </li>
         ))}
       </ul>
     </div> }*/

<div className="booklist">
  <h2>Leste bøker</h2>
  <table>
    <tbody>
      {books.map((book) => (
        // HER
        <tr key={book.documentID}>
          <td onClick={() => book.documentID && onTableCellClick(book.documentID)} style={{ cursor: "pointer" }}>
            {book.title}, {book.authors?.join(", ")}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );
}



export default ReadBooks;
