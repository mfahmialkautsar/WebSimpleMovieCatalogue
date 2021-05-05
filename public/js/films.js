import {
  getFilmsByGenre,
  getPopularFilms,
  getWatchlistMovies,
  getHomeScreen,
  getSearchFilm,
  getImagePath,
} from './at.js';
import {getGenre, movieGenre, tvGenre} from './layout.js';
import {filmCategory as fc, getProfile, pathname} from './util.js';

const moviesContainers = document.getElementsByClassName('container-movies');
const nextPageButton = document.getElementById('next-page');
const prevPageButton = document.getElementById('prev-page');
const pageNumber = document.getElementById('page-input');
const totalPagesNumber = document.getElementById('total-pages');
let filmCategory = fc;
let searchCategory;
let page;
let totalPages;
let query;
let popular;

function createImageContainer(film) {
  const filmId = film.id;
  const filmTitle = film.title || film.name;
  const filmRating = film.vote_average;
  const releaseDate = new Date(film.release_date || film.first_air_date);
  const year = releaseDate.getFullYear();
  const imageUrl = getImagePath(film.poster_path, 'poster');

  const tempDiv = document.createElement('div');
  tempDiv.setAttribute('class', 'imageContainer');
  tempDiv.setAttribute('data-id', filmId);

  let category = film.title ? 'movie' : 'tv';

  const movieElement = `
        <a href="/${category}/${filmId}">
            <div id="rating">
                <i class="fa fa-star mr5"></i>
                ${filmRating}</div>
            <img src="${imageUrl}" alt="${filmTitle}" data-movie-id="${filmId}">
            <span class="mli-info"><div id="title">${filmTitle} (${year})</div></span>
        </a>
    `;
  tempDiv.innerHTML = movieElement;

  return tempDiv;
}

function createSectionHeader(title) {
  const header = document.createElement('h3');
  header.innerHTML = title;
  header.style.display = 'inline-block';

  let headerLink;
  if (!pathname) {
    headerLink = document.createElement('a');
    headerLink.href = title.toLowerCase().includes('movies') ? '/movie' : 'tv';
    headerLink.setAttribute('class', 'nodecor-link');
    headerLink.insertBefore(header, headerLink.firstChild);
    return headerLink;
  }

  return header;
}

function renderFilms(i = 0, data) {
  moviesContainers[i].innerHTML = '';
  if (popular && (!page || page == 1)) createGenresShow();
  const moviesBlock = generateMoviesBlock(data);
  const header = createSectionHeader(this.title);
  moviesBlock.insertBefore(header, moviesBlock.firstChild);
  searchCategory &&
    moviesBlock.insertBefore(
      searchCategory,
      moviesBlock.firstChild.nextSibling
    );
  moviesContainers[i].appendChild(moviesBlock);

  goToPage(data);

  const activeButton = document.getElementById('search-' + filmCategory);
  if (activeButton) {
    activeButton.style.backgroundColor = '#010101';
    activeButton.disabled = true;
    document.getElementById('search-movie').onclick = function (e) {
      e.preventDefault();
      searchFilms('movie', query);
    };
    document.getElementById('search-tv').onclick = function (e) {
      e.preventDefault();
      searchFilms('tv', query);
    };
  }
}

function nextPage() {
  if (page < totalPages) {
    page++;
    jumpToPage();
  }
}

function prevPage() {
  if (page >= 2) {
    page--;
    jumpToPage();
  }
}

function jumpToPage() {
  if (query) {
    window.location = query + '&p=' + page;
  } else {
    const genre = new URLSearchParams(location.search).get('genre');
    if (genre) {
      window.location = `/${filmCategory}?genre=${genre}&p=${page}`;
    } else {
      window.location = `/${filmCategory}?p=${page}`;
    }
  }
}

function goToPage(data) {
  const pageInput = document.getElementById('page-input');
  if (pageInput) {
    pageInput.addEventListener('keyup', function (event) {
      event.preventDefault();
      if (event.key === 'Enter') {
        page = pageInput.value;
        jumpToPage();
      }
    });

    page = data.page;
    totalPages = data.total_pages;

    pageNumber.defaultValue = page;
    totalPagesNumber.innerHTML = totalPages;

    prevPageButton.onclick = function (event) {
      event.preventDefault();
      prevPage();
    };

    nextPageButton.onclick = function (event) {
      event.preventDefault();
      nextPage();
    };

    const prevButtonStyle = prevPageButton.style;
    if (page <= 1) {
      prevButtonStyle.display = 'none';
    } else {
      prevButtonStyle.display = 'block';
    }

    const nextButtonStyle = nextPageButton.style;
    if (page >= totalPages) {
      nextButtonStyle.display = 'none';
    } else {
      nextButtonStyle.display = 'block';
    }

    if (totalPages == 0) {
      pageNumber.disabled = true;
    }
  }
}

function generateMoviesBlock(data) {
  const films = data.results;
  const section = document.createElement('section');
  section.setAttribute('class', 'section');

  for (let i = 0; i < films.length; i++) {
    const film = films[i];
    const imageContainer = createImageContainer(film);
    section.appendChild(imageContainer);
  }

  const movieSectionAndContent = createMovieContainer(section);
  return movieSectionAndContent;
}

function createMovieContainer(section) {
  const movieElement = document.createElement('div');
  movieElement.setAttribute('class', 'movie');
  movieElement.insertBefore(section, movieElement.firstChild);
  return movieElement;
}

function getGenreName(id, completion) {
  let genreName = '';
  getGenre(filmCategory).then(() => {
    let listGenre = movieGenre;
    if (filmCategory == 'tv') {
      listGenre = tvGenre;
    }
    listGenre.forEach((genre) => {
      if (genre.id == id) {
        genreName = genre.name;
      }
    });
    completion(genreName);
  });
}

function getWatchlist() {
  document.getElementById('container-footer').style.display = 'none';
  getProfile().then((profile) => {
    if (profile.userId) {
      getWatchlistMovies(renderFilms, profile.userId);
    } else {
      renderFilms();
    }
  });
}

function getHome() {
  getHomeScreen(renderFilms);
}

function createGenresShow() {
  const genreShow = document.createElement('div');
  genreShow.setAttribute('class', 'container-genre');
  document.querySelector('.container-movies').appendChild(genreShow);
  getGenre(filmCategory).then((filmGenre) => {
    let genres = '';
    filmGenre.forEach((genre) => {
      const genreName = genre.name.toLowerCase();
      if (
        genreName == 'documentary' ||
        genreName == 'science fiction' ||
        genreName == 'tv movie' ||
        genreName == 'war & politics' ||
        genreName == 'western'
      ) {
        return;
      }

      genres += `<a class="nodecor-link" href="/${filmCategory}?genre=${
        genre.id
      }"><div class="genre-label-item" style="background-image: url('/images/genre/${
        filmCategory + '/' + genreName.replaceAll(' ', '-') + '.jpg'
      }');"><span class="container-genre-text">${genre.name}</span></div></a>`;
    });
    genreShow.innerHTML = `<h3>Genres</h3><div class="genre-label">${genres}</div>`;
  });
}

function getFilms() {
  const urlParams = new URLSearchParams(location.search);
  page = urlParams.get('p') || 1;
  const genre = urlParams.get('genre');
  const searchKey = urlParams.get('q');
  if (searchKey) {
    const theValue = decodeURIComponent(searchKey);
    query = '?q=' + theValue;
    searchCategory = document.createElement('div');
    searchCategory.setAttribute('class', 'search-filter');
    searchCategory.innerHTML = `<button id="search-movie" class="btn-filter">Movies</button> <button id="search-tv" class="btn-filter">TV Shows</button>`;
    getSearchFilm(renderFilms, filmCategory, theValue, page);
  } else {
    if (genre) {
      getGenreName(genre, (value) => {
        getFilmsByGenre(renderFilms, filmCategory, genre, value, page);
      });
    } else {
      popular = true;
      getPopularFilms(renderFilms, filmCategory, page);
    }
  }
}

function searchFilms(category, query) {
  window.location = `/${category}${query}`;
}

export {renderFilms, getHome, getFilms, getWatchlist};
