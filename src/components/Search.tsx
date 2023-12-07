import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

import { db, storage } from '../firebase-config';
import { Book } from '../schemas/Book';
import { Author } from '../schemas/Author';
import "./Search.css";


function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Book | Author)[]>([]);
  const [searchResultsUrl, setSearchResultsUrl] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const searchBooksAndAuthors = async () => {
    if (searchQuery === "") {
      setShowResults(false);
      return;
    }
    setShowResults(false);
    const q = query(
      collection(db, 'books')
    );
    const querySnapshot = await getDocs(q);

    let bookResults = querySnapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, any>;
      data["documentID"] = doc.id;
      return data as Book;
    }).map((book) => {
      const exactTitleScore = book.title.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 2.1 : 0;
      const titleScore = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
      const descriptionScore = book.description?.toLowerCase().includes(searchQuery.toLowerCase()) ? 0.5 : 0;
      const authorScore = book.authors?.join(",").toLowerCase().includes(searchQuery.toLowerCase()) ? 0.4 : 0;
      const totalScore = exactTitleScore + titleScore + authorScore + descriptionScore;
      let urlPromises = getDownloadURL(ref(storage, `books/${book.documentID}.jpg`))
      return { book, score: totalScore, urlPromises: urlPromises };
    })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    let authorsInBooksWithScore = bookResults.map((book) => {
      if (book.book.authorsID === undefined) {
        return []
      }
      return book.book.authorsID?.map((author) => {
        return { author: author, score: book.score }
      })
    }).flat()

    const bookResultsWithUrls = await Promise.all(
      bookResults.map(async (score) => ({
        ...score,
        url: await score.urlPromises,
      }))
    );


    const aQ = query(
      collection(db, 'authors')
    );
    const aQuerySnapshot = await getDocs(aQ);

    let authorResults = aQuerySnapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, any>;
      data["documentID"] = doc.id;
      return data as Author;
    }).map((author) => {
      let totalScore = 0;
      if (authorsInBooksWithScore.some((item) => item.author === author.documentID)) {
        totalScore += 0.3 * (authorsInBooksWithScore.find((item) => item.author === author.documentID)?.score ?? 0);
      }
      const exactTitleScore = author.name.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 1.6 : 0;
      const titleScore = author.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 0.7 : 0;
      const natScore = author.nationality?.toLowerCase().includes(searchQuery.toLowerCase()) ? 0.4 : 0;
      totalScore += exactTitleScore + titleScore + natScore;
      let urlPromises = getDownloadURL(ref(storage, `authors/${author.documentID}.jpg`))
      return { author, score: totalScore, urlPromise: urlPromises };
    })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const authorScoresWithUrls = await Promise.all(
      authorResults.map(async (score) => ({
        ...score,
        url: await score.urlPromise,
      }))
    );

    let combined = [...authorScoresWithUrls, ...bookResultsWithUrls];

    combined.sort((a, b) => b.score - a.score);

    setSearchResultsUrl(combined.map((result) => result.url));
    setSearchResults(combined.map((result) => { if ('book' in result) { return result.book } else { return result.author } }));
    setShowResults(true);
  };

  useEffect(() => {
    searchBooksAndAuthors();
  }, [searchQuery]);

  const handleSearchQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setShowResults(true);
  };

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const navigate = useNavigate();

  const handleSearchResultClick = (isBook: boolean, docID: string) => {
    if (!docID) {
      return;
    }
    if (isBook) {
      navigate(`/book/${docID}`);
    } else {
      navigate(`/author/${docID}`);
    }
    setShowResults(false);
    setSearchQuery('')
  };

  const handleSearchIconClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    setShowResults(true);
  }

  return (
    <div className="search-container" ref={searchContainerRef}>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchQueryChange}
        onClick={() => setShowResults(true)}
        ref={searchInputRef}
        className="search-input"
        placeholder="Søk IBDb"
      />
      <span className="search-icon" onClick={handleSearchIconClick}></span>

      {showResults && (
        <div className="search-results">
          <ul className="search-list">
            {searchResults.map((result, index) => {
              if ('title' in result) {
                return (
                  <li key={result.documentID} className="search-item" onClick={() => handleSearchResultClick(true, result.documentID ? result.documentID : "")}>
                    <img src={searchResultsUrl[index]} className="search-item-image" />
                    <div className="search-item-details">
                      <h3 className="search-item-title">{result.title}</h3>
                      {result.published && (
                        <p className="search-item-year">{result.published.toDate().getFullYear()}</p>
                      )}
                      <p className="search-item-author">{result.authors?.join(', ')}</p>
                    </div>
                  </li>
                );
              } else {
                return (
                  <li key={result.documentID} className="search-item" onClick={() => handleSearchResultClick(false, result.documentID ? result.documentID : "")}>
                    <img src={searchResultsUrl[index]} className="search-item-image" />
                    <div className="search-item-details">
                      <h3 className="search-item-title">{result.name}</h3>
                      {result.birth && !result.death && (
                        <p className="search-item-year">{Math.floor((new Date().getTime() - result.birth.toDate().getTime()) / (1000 * 60 * 60 * 24 * 365.25))} år</p>
                      )}
                      {result.death && result.birth && (
                        <p className="search-item-year">Død</p>
                      )}
                      {result.nationality && (
                        <p className="search-item-author">{result.nationality}</p>
                      )}
                    </div>
                  </li>
                );
              }
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Search;
