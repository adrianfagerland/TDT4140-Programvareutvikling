import { useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';
import { Box, Button, TextField } from '@mui/material';
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { ref, uploadBytes } from 'firebase/storage';
import { FidgetSpinner } from 'react-loader-spinner';

import { db, storage } from '../firebase-config';
import { Author } from '../schemas/Author';
import isAdmin from '../utils/admin';

function AuthorForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [deathdate, setDeathdate] = useState('');

  const handleDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  useEffect(() => {
    isAdmin().then((isAdmin) => {
      setAdmin(isAdmin);
      setIsLoading(false);
    });
  }, []);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      alert('Du må laste opp et bilde av forfatteren!')
      return;
    }
    if (!name) {
      alert('Du må fylle inn forfatterens navn!')
      return;
    }
    if (!nationality) {
      alert('Du må fylle inn forfatterens nasjonalitet!')
      return;
    }
    if (!birthdate) {
      alert('Du må fylle inn forfatterens fødselsdato!')
      return;
    }

    const author: Author = {
      name: name,
      nationality: nationality,
      birth: Timestamp.fromDate(new Date(birthdate))
    };
    if (deathdate) {
      author.death = Timestamp.fromDate(new Date(deathdate));
    }
    const document = await addDoc(collection(db, "authors"), author);
    const docID = document.id;

    const storageRef = ref(storage, `authors/${docID}.jpg`);
    await uploadBytes(storageRef, file);

    setFile(null);
    setName('');
    setNationality('');
    setBirthdate('');
    setDeathdate('');
    setFile(null);
    alert('Forfatteren ble lagt til!');
  };


  return (
    <div>
      {isLoading ? (
        <FidgetSpinner
        backgroundColor='#0096C7'
        ballColors={['0','0','0']}
        />
      ) : (
        <div>
          {admin ?
            (<div>
              <Box sx={{ width: '70%', margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Legg til forfatter</h1>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: '100%' }}>
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
                          label="Navn"
                          variant="outlined"
                          fullWidth
                          margin="normal"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          style={{ flex: 3 }}
                        />
                        <TextField
                          label="Nasjonalitet"
                          variant="outlined"
                          fullWidth
                          margin="normal"
                          value={nationality}
                          onChange={(event) => setNationality(event.target.value)}
                          style={{ flex: 2 }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <TextField
                          label="Fødselsdato"
                          InputLabelProps={{ shrink: true }}
                          type="date"
                          variant="outlined"
                          fullWidth
                          margin="normal"
                          value={birthdate}
                          onChange={(event) => setBirthdate(event.target.value)}
                          InputProps={{
                            style: { color: 'gray' },
                          }}
                        />
                        <TextField
                          label="Dødsdato (kun hvis død)"
                          InputLabelProps={{ shrink: true }}
                          type="date"
                          variant="outlined"
                          margin="normal"
                          fullWidth
                          value={deathdate}
                          onChange={(event) => setDeathdate(event.target.value)}
                          InputProps={{
                            style: { color: 'gray' },
                          }}
                        />
                      </div>
                      <Button type="submit" variant="contained" sx={{ marginTop: '20px', width: '100%', height: '60px' }}>
                        Lagre
                      </Button>
                    </form>
                  </Box>
                </Box>
              </Box>
            </div>) : (<h1>Adgang ikke tillatt.</h1>)}
        </div>
      )}
    </div>
  );
};


export default AuthorForm;
