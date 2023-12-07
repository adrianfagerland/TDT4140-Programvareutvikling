import Slideshow from "../components/Slideshow";
import AuthorSlideshow from "../components/AuthorSlideshow"
import "./HomePage.css"

function Home() {
  return (
    <div className="topPage">
      <div className="bestBooks">
        <h2>Månedens beste bøker</h2>
        <div>
        <Slideshow />
        </div>
      </div>
      
      <div className="bestAuthor">
        <h2>Månedens beste forfattere</h2>
        <div>
          <AuthorSlideshow />
        </div>
      </div>
    </div>
  )
}

export default Home;