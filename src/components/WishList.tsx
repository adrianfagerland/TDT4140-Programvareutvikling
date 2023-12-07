import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDocs, getDoc, CollectionReference, documentId } from "firebase/firestore";
import { TableContainer, Table, Paper, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

import { db } from "../firebase-config";
import { Book } from "../schemas/Book";


interface Props {
    userId: string;
}

function WishList(props: Props) {
    const [rows, setRows] = useState<Book[]>([]);


    const navigate = useNavigate();
    // HER
    const onTableCellClick = (documentID: string) => {
        navigate(`/book/${documentID}`);
    };


    useEffect(() => {
        async function getUserData() {
            const userDocRef = doc(db, "users", props.userId);
            const userDoc = await getDoc(userDocRef);

            const userData = userDoc.data() ?? {};
            return userData;
        }

        async function getBooksData() {
            const booksRef = collection(db, "books") as CollectionReference<Book>;
            const booksSnapshot = await getDocs<Book>(booksRef);

            let booksData = booksSnapshot.docs.map((doc) => {
                const data = doc.data() as Record<string, any>;
                data["documentID"] = doc.id;
                return data as Book;
            })


            return booksData;

        }

        async function getWishlist() {
            const userData = await getUserData();


            const booksData = await getBooksData();



            const wishList = userData.Wishlist || [];
            const filteredBooks = booksData.filter((book) => {
                return wishList.includes(book.documentID);
            });
            setRows(filteredBooks);
            return filteredBooks;

        } getWishlist()

    }, [props.userId]);



    return (
        <div className="booklist">
            <h2>Min ønskeliste</h2>
            <table>
                <tbody>
                    {rows.map((book) => (
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
export default WishList;
