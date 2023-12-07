import { TableContainer, Table, Paper, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";
import React from "react";

import { useState, useEffect } from "react";
import { db } from "../firebase-config.js";
import { collection, query, onSnapshot, doc, deleteDoc, DocumentData} from "firebase/firestore";
import { useNavigate } from 'react-router-dom';


export default function Books() {

    //our table will display whatever data is in 'rows'
    const [rows, setRows] = useState<DocumentData[]>([]);

    //getBooks functions to attach a listener and fetch book data
    const getBooks = () => {
        const q = query(collection(db, "books"));
        onSnapshot(q, (querySnapshot) => {
            const rows: DocumentData[] = [];
            querySnapshot.forEach((doc) => {
                rows.push({ ...doc.data(), id: doc.id })
            });
            setRows(rows);
        });
    };

    //call getBooks when app is loaded
    useEffect(() => {
        getBooks();
    }, []);

    const deleteBook = async (id: string, title: string) =>{
        await deleteDoc(doc(db, "books", id));
        alert(title +" har blitt slettet.")
    }

    const navigate = useNavigate();

    return (
        <div style={{width:"80%", margin: "0 auto" }}>
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 750 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Tittel</TableCell>
                        <TableCell>Forfattere</TableCell>
                        <TableCell>Antall sider</TableCell>
                        <TableCell>ISBN</TableCell>
                        <TableCell>Delete</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <TableRow
                            key={index}
                            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                        >
                            <TableCell component="th" scope="row" onClick={() => navigate("/book/" + row.id)} style={{"textDecoration": "underline", "cursor": "pointer"}}>{row.title}</TableCell>
                            <TableCell>{row.authors?.join(', ')}</TableCell>
                            <TableCell>{row.pages}</TableCell>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>
                                <Button id="delete" variant="outlined" color="error" onClick={()=>deleteBook(row.id, row.title)}>
                                    Slett
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        </div>
    );
}
