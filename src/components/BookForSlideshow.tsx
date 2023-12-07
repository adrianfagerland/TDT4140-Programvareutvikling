import { textAlign } from '@mui/system';
import { getDownloadURL, ref } from 'firebase/storage';
import { useState } from 'react';
import { storage } from '../firebase-config';
import { Book } from '../schemas/Book'


interface BookForSlideshowProps {
  book: Book;
  isbn: string;
}

function BookForSlideshow ({ book, isbn } : BookForSlideshowProps) {
  const [imageURL, setImageURLState] = useState<string>();

  const setImageURL = async (isbn: string) => {
    setImageURLState(await getDownloadURL(ref(storage, `books/${isbn}.jpg`)));
  }
  setImageURL(isbn);
  
    return (
      <div style={{ marginTop: 10 }}>
        <img src={imageURL} style={{ display:"block", marginLeft:"auto", marginRight:"auto", width: "150px", height: "250px" , borderRadius:"5px"}} />
        <h2>{book.title}</h2>
        <div>Forfattere: {book.authors?.join(', ')}</div>
      </div>
    );
  }
export default BookForSlideshow;