import { useEffect, useLayoutEffect, useState } from "react";
import { db } from "../firebase-config.js";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { Book } from "../schemas/Book.js";
import BookForSlideshow from "./BookForSlideshow";

function Slideshow() {
  const [documentIDs, setDocumentIDs] = useState<string[]>([]);
  const [bookDocs, setBookDocs] = useState<Book[]>([]);
  const [books, setBooks] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getBooks = async () => {
    const q = query(collection(db, "books"));
    const querySnapshot = await getDocs(q);
    const tmp = querySnapshot.docs.map((doc) => doc.id);

    const promises = tmp.map((book) => {
      const q = query(collection(db, "reviews"), where("book", "==", book));
      return getDocs(q);
    });

    const booksRatingArr: number[] = [];
    const booksRatingAmountArr: number[] = [];

    const results = await Promise.all(promises);
    results.forEach((querySnapshot) => {
      let ratingAmount = 0;
      let ratings = 0;
      querySnapshot.forEach((doc) => {
        ratingAmount += parseInt(doc.get("rating"));
        ratings++;
      });
      booksRatingArr.push(ratingAmount);
      booksRatingAmountArr.push(ratings);
    });

    const tmpMap = new Map();
    tmp.forEach((book) => {
      let temp =
        booksRatingArr[tmp.indexOf(book)] /
        booksRatingAmountArr[tmp.indexOf(book)];
      if (!isNaN(temp)) {
        tmpMap.set(book, temp);
      }
    });

    const tmpMap2 = new Map([...tmpMap.entries()].sort((a, b) => b[1] - a[1]));

    const bookDocs = await getDisplayBooks(tmpMap2);
    setBookDocs(bookDocs);
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchData, 1200);
    async function fetchData() {
      await getBooks();
    }
    fetchData();
  }, []);
  

  useEffect(() => {
    const interval = setInterval(() => {
    if (currentIndex === bookDocs.length - 1) {
    setCurrentIndex(0);
    } else {
    setCurrentIndex(currentIndex + 1);
    }
    }, 5000);
    return () => clearInterval(interval);
    }, [currentIndex, bookDocs]);

  const getDisplayBooks = async (
    sortedMap: Map<string, any>
  ): Promise<Book[]> => {
    const bookDocs: Array<Book> = [];
    const docRefs = Array.from(sortedMap.keys()).map((key) =>
      doc(db, "books", key)
    );
    const queryRef = query(
      collection(db, "books"),
      where("__name__", "in", docRefs)
    );
    const querySnapshot = await getDocs(queryRef);
    querySnapshot.forEach((doc) => {
      if (doc.exists()) {
        const bookDoc = doc.data() as Book;
        bookDocs.push(bookDoc);
        books.push(doc.id)
      }
    });
    const ids = querySnapshot.docs.map((doc) => doc.id)
    setDocumentIDs(ids);
    return bookDocs;
  };

  const prevSlide = () => {
    if (currentIndex === 0) {
      setCurrentIndex(bookDocs.length - 1);
    } else {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const nextSlide = () => {
    if (currentIndex === bookDocs.length - 1) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="slideshow">
      <button className="prev" onClick={prevSlide}>
        &#10094;
      </button>
      <button className="next" onClick={nextSlide}>
        &#10095;
      </button>
      {bookDocs.map((book, index) => (
        <div
          key={book.description}
          className={index === currentIndex ? "slide active" : "slide"}
        >
          {index === currentIndex && <BookForSlideshow book={book} isbn={documentIDs.at(currentIndex)!} />}
        </div>
      ))}
    </div>
  );
}

export default Slideshow;
