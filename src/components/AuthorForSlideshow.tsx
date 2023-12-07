import { margin } from "@mui/system";
import { getDownloadURL, ref } from "firebase/storage";
import { useState } from "react";
import { storage } from "../firebase-config";

interface AuthorForSlideshowProps {
  author: string;
  id?: string;
}

function AuthorForSlideshow({ author, id }: AuthorForSlideshowProps) {
  const [imageURL, setImageURLState] = useState<string>();

  const setImageURL = async (id: string) => {
    setImageURLState(await getDownloadURL(ref(storage, `authors/${id}.jpg`)));
  };

  if (id) {
    setImageURL(id);
  }

  return (
    <div style={{ marginTop: 10 }}>
      <img
        src={imageURL}
        style={{
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
          width: "150px",
          height: "250px",
          borderRadius: "5px",
        }}
      />
      <div style={{marginTop: '25px'}}>{author}</div>
    </div>
  );
}

export default AuthorForSlideshow;
