import { SetStateAction, useEffect, useLayoutEffect, useState } from "react";
import { db } from "../firebase-config.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import AuthorForSlideshow from "./AuthorForSlideshow.js";

function AuthorSlideshow() {
  const [topAuthors, setTopAuthors] = useState<string[]>([]);
  const [authorIDs, setAuthorIDs] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const topAuthorsArray = await AuthorSlideshow2();
      setTopAuthors(topAuthorsArray);
      setIsLoaded(true); // set loaded state to true once data is fetched
    }
    fetchData().then(() => {
      getAuthorIDs();
    });
  }, []);

  useEffect(() => {
    async function fetchAuthorIDs() {
      const tmp: string[] = [];
      const tmp2: string[] = [];
      for (const author of topAuthors) {
        const q = query(collection(db, "authors"), where("name", "==", author));
        const qSnapshot = await getDocs(q);
        qSnapshot.forEach((doc) => {
          tmp.push(doc.id);
          tmp2.push(author);
        });
      }
      setAuthorIDs(tmp);
      setAuthors(tmp2);
    }

    if (topAuthors.length > 0) {
      fetchAuthorIDs();
    }
  }, [topAuthors]);

  useLayoutEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex === authors.length - 1) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, authors]);

  async function AuthorSlideshow2() {
    const booksQuery = query(collection(db, "books"));

    const booksSnapshot = await getDocs(booksQuery);
    const authorsMap = new Map<
      string,
      { ratingsSum: number; ratingsCount: number }
    >();

    for (const book of booksSnapshot.docs) {
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("book", "==", book.id)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);

      let totalRating = 0;
      let reviewCount = 0;

      reviewsSnapshot.forEach((review) => {
        totalRating += review.data().rating;
        reviewCount += 1;
      });

      if (reviewCount > 0) {
        const authors = book.data().authors;

        authors.forEach((author: string) => {
          const currentAuthor = authorsMap.get(author);
          if (currentAuthor) {
            currentAuthor.ratingsSum += totalRating;
            currentAuthor.ratingsCount += reviewCount;
          } else {
            authorsMap.set(author, {
              ratingsSum: totalRating,
              ratingsCount: reviewCount,
            });
          }
        });
      }
    }

    const authorsArray = Array.from(
      authorsMap,
      ([author, { ratingsSum, ratingsCount }]) => ({
        author,
        rating: ratingsSum / ratingsCount,
      })
    );

    authorsArray.sort((a, b) => b.rating - a.rating);

    const topAuthorsArray = authorsArray
      .slice(0, 5)
      .map((authorObj) => authorObj.author);

    setTopAuthors(topAuthorsArray);
    return topAuthorsArray;
  }

  function getAuthorIDs() {
    const tmp: SetStateAction<string[]> = [];
    const tmp2: SetStateAction<string[]> = [];
    topAuthors.forEach(async (author) => {
      const q = query(collection(db, "authors"), where("name", "==", author));
      const qSnapshot = await getDocs(q);
      qSnapshot.forEach((doc) => {
        tmp.push(doc.id);
        tmp2.push(author);
      });
      setAuthorIDs(tmp);
      setAuthors(tmp2);
    });
  }

  if (!isLoaded) {
    return <div>Loading...</div>; // show loading message while data is being fetched
  }

  const prevSlide = () => {
    if (currentIndex === 0) {
      setCurrentIndex(authors.length - 1);
    } else {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const nextSlide = () => {
    if (currentIndex === authors.length - 1) {
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
      {authors.map((author, index) => (
        <div
          key={author}
          className={index === currentIndex ? "slide active" : "slide"}
        >
          {index === currentIndex && <AuthorForSlideshow author={author} id={authorIDs.at(authors.indexOf(author))!.toString()} />}
        </div>
      ))}
    </div>
  );
}

export default AuthorSlideshow;