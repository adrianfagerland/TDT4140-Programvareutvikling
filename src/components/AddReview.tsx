import {
  Button,
  Container,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from "@mui/material";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { auth, db } from "../firebase-config";
import { Review } from "../schemas/Review"
import { User } from '../schemas/User';


function addReview() {
  const [rating, setRating] = useState("1");
  const [text, setText] = useState("");
  const isbn = useParams().isbn;
  const published = Timestamp.fromDate(new Date());

  const handleChange = (event: SelectChangeEvent) => {
    setRating(event.target.value);
  };

  const insertReview = async () => {
    const user = auth.currentUser?.uid;
    const fetchedUsername = getUsername(user || "");
    const username: string = (await fetchedUsername).toString();
    const book = isbn;
    const documentID = book! + user;

    if (parseInt(rating) > 0 && parseInt(rating) < 7) {
      try {
        const review: Review = {
          user: user!,
          username: username,
          book: book!,
          rating: parseInt(rating),
          text: text,
          published: published
        };
        const docRef = doc(db, 'reviews', documentID);
        await setDoc(docRef, review);
      } catch (e) {
        console.error("Error adding review: ", e);
      }
    } else {
      alert("Du må skrive inn en vurdering mellom 1 og 6!");
    }
  };

  async function getUsername(userid: string): Promise<string> {
    const docRef = doc(db, "users", userid);
    const docSnap = await getDoc(docRef);
    const user = docSnap.data() as User;
    const username = user.name;

    return username;
  }
  return (
    <div>
      <Container
        component={Paper}
        sx={{ marginBottom: "20px", padding: "20px" }}
      >
        <h2 style={{ fontSize: "20px" }}>Legg til vurdering</h2>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Review"
            value={text}
            type="text"
            onChange={(e) => {
              setText(e.target.value);
            }}
          />
          <Select label="Rating" value={rating} onChange={handleChange}>
            <MenuItem value={"1"}>1</MenuItem>
            <MenuItem value={"2"}>2</MenuItem>
            <MenuItem value={"3"}>3</MenuItem>
            <MenuItem value={"4"}>4</MenuItem>
            <MenuItem value={"5"}>5</MenuItem>
            <MenuItem value={"6"}>6</MenuItem>
          </Select>
          <Button variant="contained" onClick={insertReview}>
            Legg til vurdering
          </Button>
        </Stack>
      </Container>
    </div>
  );
}

export default addReview;
