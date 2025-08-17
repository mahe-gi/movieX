import { useEffect, useState } from "react";
import Search from "./components/search";

const BASE_API_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

export default function App() {
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMovies = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endPoint = `${BASE_API_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endPoint, options);
      if (!response.ok) {
        throw new Error("Error ");
      }
      const data = await response.json();

      console.log(data.results);

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies .. ");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);
    } catch (e) {
      console.log(e);
      setErrorMessage("Error Fetching Movies Please Try again Later ..");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);
  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <h1>
            <img src="./hero-img.png" alt="Hero Banner" />
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search search={search} setSearch={setSearch} />
        </header>
        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <p className="text-white">Loading...</p>
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <></>
          )}
        </section>
      </div>
    </main>
  );
}
