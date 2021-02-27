import React, { Component } from "react";
import { Link } from "react-router-dom";
import MoviesTable from "./moviesTable";
import ListGroup from "./common/listGroup";
import Pagination from "./common/pagination";

import { getMovies, deleteMovie } from "../services/movieService";
import { getGenres } from "../services/genreService";
import { paginate } from "../utils/paginate";

import _ from "lodash";
import SearchBox from "./searchBox";


class Movies extends Component {
  state = {
    movies: [],
    genres: [],
    pageSize: 4,
    currentPage: 1
  };

  async componentDidMount() {
    const { data } = await getGenres();
    console.log(data);
    const genres = [{ name: "All Genres", _id: "" }, ...data]
    console.log(genres);
    const { data: movies } = await getMovies();
    this.setState({ movies, genres });
  }

  paginateMovies(page = 1) {
    let moviesCopy = [...this.state.movies];
    const pages = [];
    while (moviesCopy.length) {
      pages.push(moviesCopy.splice(0, 4));
    }
    const selectedPage = pages[page - 1];
    return selectedPage;
  }

  handlePageChange = page => {
    this.setState({ currentPage: page });
  }

  handleGenreSelect = genre => {
    this.setState({ selectedGenre: genre, currentPage: 1 })
  }

  handleDelete = async movie => {
    const originalMovies = this.state.movies;
    const movies = originalMovies.filter(m => m._id !== movie._id);
    this.setState({ movies });
    try {
      await deleteMovie(movie._id);
    }
    catch (ex) {
      if (ex.response && ex.response.status == 404)
        toast.error('this movie  has ready been deleted');
      this.setState({
        movies: originalMovies
      });
    }


  };

  handleLike = movie => {
    const movies = [...this.state.movies];
    const index = movies.indexOf(movie);
    movies[index] = { ...movies[index] };
    movies[index].liked = !movies[index].liked;
    this.setState({ movies });
  }

  render() {
    const { length: count } = this.state.movies;
    const { pageSize, currentPage, movies: allMovies, selectedGenre, genres } = this.state;

    if (count === 0) return <p>There are no movies in the database.</p>

    const filtered =
      selectedGenre && selectedGenre._id
        ? allMovies.filter(m => m.genre._id === selectedGenre._id)
        : allMovies;

    const movies = paginate(filtered, currentPage, pageSize);

    return (
      <div className="row">
        <div className="col-3">
          <ListGroup
            items={genres}
            selectedItem={selectedGenre}
            onItemSelect={this.handleGenreSelect}
          />
        </div>
        <div className="col">
          <p>Showing {filtered.length} movies in the database.</p>
          <MoviesTable
            movies={movies}
            onLike={this.handleLike}
            onDelete={this.handleDelete}
          />
          <Pagination
            itemsCount={filtered.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
      </div>
    );
  }
}

export default Movies;
