import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { onSnapshot, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { FidgetSpinner } from "react-loader-spinner";

import { auth, db, storage } from "../firebase-config";
import { Book } from "../schemas/Book";
import AddReview from "../components/AddReview";
import Reviews from "../components/Reviews";
import AverageRating from "../components/AverageRating";
import "../index.css";
import "./BookPage.css";
import { onAuthStateChanged } from "firebase/auth";

function BookPage() {
  const { isbn } = useParams();

  const [book, setBook] = useState<Book>();
  const [bookExists, setBookExists] = useState(true);
  const [imageURL, setImageURLState] = useState<string>();
  const [hasAddedWish, setHasAddedWish] = useState(false);
  const [wButtonName, setWButtonName] = useState("Legg til i min ønskeliste")
  const [hasReadBook, setHasReadBook] = useState(false);
  const [buttonName, setButtonName] = useState("Legg til i leste bøker");
  const [isModalOpen, setIsModalOpen] = useState(false);


  const setImageURL = async () => {
    setImageURLState(await getDownloadURL(ref(storage, `books/${isbn}.jpg`)));
  }
  const getBook = () => {
    if (isbn !== undefined) {
      const bookRef = doc(db, "books", isbn);
      onSnapshot(bookRef, (doc) => {
        if (doc.data()) {
          const book = doc.data() as Book;
          setBook(book);
          setImageURL();
          setBookExists(true);
        }
        else {
          setBookExists(false);
        }
      })
    }
  };

  const handleHasAddedWish = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Du må logge inn for å legge til bok i leste bøker");
      return;
    }
    const userDocRef = doc(db, "users", currentUser.uid);
    const userDocSnapshot = await getDoc(userDocRef);
    const userData = userDocSnapshot.data();
    const wishlist = userData?.Wishlist || [];
    if (hasAddedWish) {
      const updatedWishlist = wishlist.filter((isbnInWishlist: string) => isbnInWishlist !== isbn);
      await updateDoc(userDocRef, { Wishlist: updatedWishlist }).then(() => {
        setHasAddedWish(false);
        setWButtonName("Legg til i min ønskeliste");
      })
        .catch((error) => {
          alert("En feil oppstod ved fjerning av bok fra leste bøker: " + error.message); // Set error message
        });
    }
    else {
      updateDoc(userDocRef, {
        Wishlist: arrayUnion(isbn),
      }).then(() => {
        setHasAddedWish(true);
        setWButtonName("Fjern fra min ønskeliste");
      })
        .catch((error) => {
          alert("En feil oppstod ved innleggelsen av boken i leste bøker: " + error.message); // Set error message
        });
    }
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      getDoc(userDocRef)
        .then((doc) => {
          if (doc.exists()) {
            const data = doc.data();
            if (data.Wishlist.includes(isbn)) {
              setHasAddedWish(true);
              setWButtonName("Fjern fra min ønskeliste");
            } else {
              setHasAddedWish(false);
              setWButtonName("Legg til i min ønskeliste");
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });

  const handleHasReadBook = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Du må logge inn for å legge til bok i Leste bøker");
      return;
    }

    const userDocRef = doc(db, "users", currentUser.uid);
    const userDocSnapshot = await getDoc(userDocRef);
    const userData = userDocSnapshot.data();
    const readBooks = userData?.read || [];

    if (hasReadBook) {
      const updatedReadBooks = readBooks.filter((isbnInRead: string) => isbnInRead !== isbn);

      await updateDoc(userDocRef, { read: updatedReadBooks }).then(() => {
        setHasReadBook(false);
        setButtonName("Legg til i Har lest");

      })
        .catch((error) => {
          alert("En feil oppstod ved fjerning av bok fra Leste bøker: " + error.message); // Set error message
        });
    }
    else {
      updateDoc(userDocRef, {
        read: arrayUnion(isbn),
      }).then(() => {
        setHasReadBook(true);
        setButtonName("Fjern fra Har lest");
      })
        .catch((error) => {
          alert("En feil oppstod ved innleggelsen av boken i Leste bøker: " + error.message); // Set error message
        });
    }
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      getDoc(userDocRef)
        .then((doc) => {
          if (doc.exists()) {
            const data = doc.data();
            if (data.read.includes(isbn)) {
              setHasReadBook(true);
              setButtonName("Fjern fra Leste bøker");
            } else {
              setHasReadBook(false);
              setButtonName("Legg til i Leste bøker");
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });


  useEffect(() => {
    getBook();
  }, [isbn]);

  if (!bookExists) {
    return <h1>404 Bok ikke funnet</h1>;
  }



  return (
    <div className="page">
      {book ? (
        <>
          <div className="book">
            <div className="bookimg">
              <img src={imageURL} style={{ width: "200px", height: "300px", borderRadius: "5px" }} />
            </div>
            <div className="bookinfo">
              <h1>
                {book.title} {hasReadBook ? <img src="/check_circle.png" alt="check" /> : null}
              </h1>

              <div className="author">{book.authors?.join(', ')}</div>
              <AverageRating />
              <div>{book.description}</div>
              <div>Antall sider: {book.pages}</div>
            </div>
          </div>
          <div className="reviewmodal">



            <button onClick={handleHasAddedWish}>{wButtonName}</button>
            <button onClick={handleHasReadBook}>{buttonName}</button>
            <button onClick={() => setIsModalOpen(!isModalOpen)} disabled={!hasReadBook}>
              Legg til vurdering
            </button>

            {isModalOpen && (
              <div>
                <AddReview />
                <button onClick={() => setIsModalOpen(false)}>Lukk</button>
              </div>
            )}


          </div>

          <Reviews isbn={isbn} />
        </>
      ) : (
        <FidgetSpinner
          backgroundColor="#0096C7"
          ballColors={["0", "0", "0"]}
        />
      )}
    </div>
  );
}

export default BookPage;
