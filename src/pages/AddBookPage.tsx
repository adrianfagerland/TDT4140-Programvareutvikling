import { useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';
import { Box, Button, TextField, Select, MenuItem, InputLabel, OutlinedInput, SelectChangeEvent, Checkbox, ListItemText, FormControl } from '@mui/material';
import { collection, doc, getDocs, query, setDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes } from 'firebase/storage';
import { FidgetSpinner } from 'react-loader-spinner';

import { db, storage } from '../firebase-config';
import { Author } from '../schemas/Author';
import { Book } from '../schemas/Book';
import isAdmin from '../utils/admin';

const MultipleAuthorsCheckmarks = (authors: Author[], selectedAuthors: Author[], setSelectedAuthors: React.Dispatch<React.SetStateAction<Author[]>>, selectedAuthorIDs: string[], setSelectedAuthorIDs: React.Dispatch<React.SetStateAction<string[]>>) => {
  useEffect(() => {
    setSelectedAuthors(authors.filter(author => selectedAuthorIDs.includes(author.documentID ? author.documentID : "[[[[{[[")));
  }, [authors, selectedAuthorIDs]);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const selectedAIDs = event.target.value as string[];
    setSelectedAuthorIDs(selectedAIDs)
  };

  return (
    <FormControl style={{ flex: 2 }}>
      <InputLabel id="demo-multiple-checkbox-label">Forfatter(e)</InputLabel>
      <Select
        labelId="demo-multiple-checkbox-label"
        id="demo-multiple-checkbox"
        multiple
        value={selectedAuthorIDs}
        onChange={handleChange}
        input={<OutlinedInput label="Forfatter(e)" />}
        renderValue={(selected) => selected.map((authorID) => authors.find(author => author.documentID === authorID)?.name).join(', ')}
      >
        {authors.map((author) => (
          <MenuItem key={author.documentID} value={author.documentID}>
            <Checkbox checked={selectedAuthors.includes(author)} />
            <ListItemText primary={author.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}


const MultipleBooksCheckmarks = (genres: string[], selectedGenres: string[], setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>) => {
  const handleChange = (event: SelectChangeEvent<typeof selectedGenres>) => {
    const {
      target: { value },
    } = event;
    setSelectedGenres(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <FormControl style={{ flex: 2 }}>
      <InputLabel id="demo-multiple-checkbox-label">Sjanger</InputLabel>
      <Select
        labelId="demo-multiple-checkbox-label"
        id="demo-multiple-checkbox"
        multiple
        value={selectedGenres}
        onChange={handleChange}
        input={<OutlinedInput label="Sjanger" />}
        renderValue={(selected) => selected.join(', ')}
      >
        {genres.map((genre) => (
          <MenuItem key={genre} value={genre}>
            <Checkbox checked={selectedGenres.indexOf(genre) > -1} />
            <ListItemText primary={genre} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

interface BookFormContentProps {
  isLoading: boolean;
  admin: boolean;
}

const BookFormContent: React.FC<BookFormContentProps> = ({ isLoading, admin }) => {

  if (isLoading) {
    return (
      <FidgetSpinner
        backgroundColor="#0096C7"
        ballColors={["0", "0", "0"]}
      />
    );
  }

  if (!admin) {
    return (<h1>Adgang ikke tillatt.</h1>)
  }

  const [file, setFile] = useState<File | null>(null);
  const [isbn, setISBN] = useState("");
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<Author[]>([]);
  const [selectedAuthorIDs, setSelectedAuthorIDs] = useState<string[]>([]);
  const genres = ['Akademisk','Apokalyptisk','Biografi','Eventyr','Fantasy','Filosofi','Historisk','Komedie','Krim','Reise','Religiøs','Roman','Romantikk','Science Fiction','Skrekk','Spenning','Thriller','Tragedie']
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [pages, setPages] = useState("");
  const [published, setPublished] = useState("");

  const handleDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  useEffect(() => {
    const getAuthors = async () => {
      const q = query(collection(db, 'authors'));
      const qSnapshot = await getDocs(q);
      const authorResults = qSnapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, any>;
        data["documentID"] = doc.id;
        return data as Author;
      })
      setAuthors(authorResults);
    };
    getAuthors();
  }, []);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      alert('Du må laste opp et bilde av boken!')
      return;
    }
    if (!isbn || !title || !description || !pages || !published || !selectedAuthors || !selectedGenres) {
      alert('Du må fylle inn alle feltene!')
      return;
    }

    const book: Book = {
      title: title,
      authors: selectedAuthors.map(author => author.name),
      authorsID: selectedAuthors.map(author => author.documentID ? author.documentID : ""),
      description: description,
      genre: selectedGenres,
      pages: parseInt(pages),
      published: Timestamp.fromDate(new Date(published))
    }
    setDoc(doc(db, "books", isbn), book);

    const storageRef = ref(storage, `books/${isbn}.jpg`);
    await uploadBytes(storageRef, file);

    setTitle("");
    setISBN("");
    setDescription("");
    setPages("");
    setPublished("");
    setSelectedAuthors([]);
    setSelectedGenres([]);
    setSelectedAuthorIDs([]);
    setFile(null);
    alert("Boken ble lagt til!");
  };

  return (
    <div>
      <Box sx={{ width: '70%', margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Legg til bok</h1>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'left', width: '100%' }}>
          <Box sx={{
            border: '1px dashed grey',
            borderRadius: '10px',
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            marginRight: '20px', // add some space between the dropzone and input fields
            order: 1, // move the dropzone to the left
          }}>
            <Dropzone onDrop={handleDrop} multiple={false} maxSize={52428800} accept={{ "images/jpg": [".jpg", ".jpeg"] }}>
              {({ getRootProps, getInputProps }) => (
                <Box {...getRootProps()}>
                  <input {...getInputProps()} />
                  {file ? (
                    <img src={URL.createObjectURL(file)} alt="forhåndsvisning" width="200px" height="300px" />
                  ) : (
                    <p>Dra og slipp et bilde her, eller klikk for å velge en fil</p>
                  )}
                </Box>
              )}
            </Dropzone>
          </Box>
          <Box sx={{ flex: 1, order: 2 }}> {/* use flex: 1 to take up remaining space */}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <TextField
                  label="Tittel"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  style={{ flex: 4 }}
                />
                <TextField
                  label="ISBN"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={isbn}
                  onChange={(event) => setISBN(event.target.value)}
                  style={{ flex: 2 }}
                />
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <TextField
                  label="Beskrivelse"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  style={{ marginTop: '0px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {MultipleAuthorsCheckmarks(authors, selectedAuthors, setSelectedAuthors, selectedAuthorIDs, setSelectedAuthorIDs)}
                {MultipleBooksCheckmarks(genres, selectedGenres, setSelectedGenres)}
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <TextField
                  label="Utgivelsesdato"
                  InputLabelProps={{ shrink: true }}
                  type="date"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={published}
                  onChange={(event) => setPublished(event.target.value)}
                  InputProps={{
                    style: { color: 'gray' },
                  }}
                  style={{ marginTop: '8px' }}
                />
                <TextField
                  label="Antall sider"
                  type="number"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={pages}
                  onChange={(event) => setPages(event.target.value)}
                  style={{ marginTop: '8px' }}
                />
              </div>
              <Button type="submit" variant="contained" sx={{ marginTop: '20px', width: '100%', height: '60px' }}>
                Lagre
              </Button>
            </form>
          </Box>
        </Box>
      </Box>
    </div>
  );
}

const BookForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    isAdmin().then((isAdmin) => {
      setAdmin(isAdmin);
      setIsLoading(false);
    });
  }, []);

  return <BookFormContent isLoading={isLoading} admin={admin} />;
}

export default BookForm;
