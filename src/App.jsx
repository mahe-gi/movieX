import { useEffect, useState } from "react";
import Search from "./components/Search";
import MovieCard from "./components/MovieCard";
import { getTrendingMovies, updateSearchCount } from "./appwrite";

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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [trendingMovies, setTrendingMovies] = useState([]);
  const fetchMovies = async (query) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endPoint = query
        ? `${BASE_API_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${BASE_API_URL}/discover/movie?sort_by=popularity.desc`;

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

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (e) {
      console.log(e);
      setErrorMessage("Error Fetching Movies Please Try again Later ..");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);
  useEffect(() => {
    fetchMovies(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>

          <Search search={search} setSearch={setSearch} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <h2>Loading...</h2>
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
