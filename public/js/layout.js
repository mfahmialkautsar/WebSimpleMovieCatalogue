import {generateListGenreUrl} from './at.js';
import {filmCategory, sleep} from './util.js';

const header = document.getElementById('header');
let lastScroll = 0;

function addScroll() {
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll < 0.01) {
      header.classList.remove('scroll-up');
      header.classList.remove('scroll-down');
      return;
    }

    if (
      (currentScroll > lastScroll &&
        !header.classList.contains('scroll-down')) ||
      currentScroll == 130
    ) {
      header.classList.remove('scroll-up');
      header.classList.add('scroll-down');
    } else if (
      currentScroll < lastScroll &&
      header.classList.contains('scroll-down')
    ) {
      header.classList.remove('scroll-down');
      header.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
  });
}

let movieGenre = [];
let tvGenre = [];
let fetchingMovieGenre = false;
let fetchingTvGenre = false;

function fetchGenreDone(category) {
  if (category == 'movie') {
    fetchingMovieGenre = false;
  } else if (category == 'tv') {
    fetchingTvGenre = false;
  }
}

function fetchGenreStarted(category) {
  if (category == 'movie') {
    fetchingMovieGenre = true;
  } else if (category == 'tv') {
    fetchingTvGenre = true;
  }
}

function fetchGenreStatus(category) {
  if (category == 'movie') {
    return fetchingMovieGenre;
  } else {
    return fetchingTvGenre;
  }
}

function getGenreList(category) {
  if (category == 'movie') {
    return movieGenre;
  } else {
    return tvGenre;
  }
}

function setGenreList(category, value) {
  if (category == 'movie') {
    movieGenre = value;
  } else {
    tvGenre = value;
  }
}

async function getGenre(category, callback) {
  if (getGenreList(category).length > 0) {
    callback && callback(getGenreList(category));
    return getGenreList(category);
  } else {
    if (!fetchGenreStatus(category)) {
      fetchGenre(category);
      return getGenre(category);
    } else {
      await sleep(500);
      return await getGenre(category);
    }
  }
}

function fetchGenre(category) {
  fetchGenreStarted(category);
  fetch(generateListGenreUrl(category))
    .then((response) => response.json())
    .then((responseGenre) => {
      setGenreList(category, responseGenre.genres);
      createGenreElement(category, getGenreList(category));
      fetchGenreDone(category);
    })
    .catch();
}

function createGenreElement(category, listGenre) {
  const genreContainer = document.getElementById('genre-' + category);
  let inner = '';
  listGenre.forEach((genre) => {
    const genreElement = `
        <li class="genre-menuitem" id="${genre.name}">
            <a href="/${category}?genre=${genre.id}" class="nodecor-link">${genre.name}</a>
        </li>
        `;
    inner += genreElement;
  });
  genreContainer.innerHTML = inner;
  return genreContainer;
}

function createHeader() {
  document.getElementById('header').innerHTML = `
    <div class="topnav">
        <div class="left-header">
            <div id="hamburger" class="edge mobile-menu">
                <i class="fa fa-bars fa-lg pointer"></i>
            </div><div id="logo" class="edge inline-center">
                <a href="/" class="nodecor">
                    <b><span style="color: var(--color-secondary);">Movie</span> <span style="color: var(--color-font-primary);">Catalogue</span></b>
                </a>
            </div><nav class="supernav-container focused">
                <ul class="ulnavbar">
                    <li class="menuitem menuitem-parent">
                        <a class="menuitem-title nodecor-link" href="/movie">
                            Movies
                        </a>
                        <div class="menu-dropdown">
                            <ul id="genre-movie" class="sub-menu ulnavbar"></ul>
                        </div>
                    </li>
                    <li class="menuitem menuitem-parent">
                        <a class="menuitem-title nodecor-link" href="/tv">
                            TV Shows
                        </a>
                        <div class="menu-dropdown">
                            <ul id="genre-tv" class="sub-menu ulnavbar"></ul>
                        </div>
                    </li>
                    <li id="watchlist" class="menuitem hidden">
                        <a class="menuitem-title nodecor-link" href="/watchlist">
                                Watchlist
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
        <div id="right-header">
            <ul class="ulnavbar">
                <li id="search-box" class="focused">
                    <form>
                        <input type="text" id="movie-input" class="form-control" aria-describedby="emailHelp"
                        placeholder="Search Films..." /><button type="submit" id="search-submit" class="search-submit">
                            <i class="fa fa-search pointer"></i>
                        </button>
                    </form>
                </li>
                <li id="search" class="navitem">
                    <i class="fa fa-search fa-lg pointer" style="padding: 0;"></i>
                </li>
                <li id="login" class="edge navitem hidden">
                </li>
            </ul>
        </div>
    </div>
    `;
}

function searchButton() {
  const supernavContainer = document.querySelector('.supernav-container');
  const searchBox = document.getElementById('search-box');
  const searchButton = document.querySelector('#search');
  const searchSubmit = document.querySelector('#search-submit');
  const searchInput = document.querySelector('#movie-input');
  hamburger();

  searchButton.onclick = function () {
    if (searchBox.classList.contains('mobile')) {
      searchBox.classList.remove('mobile');
    } else {
      supernavContainer.classList.remove('mobile');
      searchBox.classList.add('mobile');
      document.getElementById('movie-input').focus();
    }
  };

  searchSubmit.onclick = function (event) {
    event.preventDefault();
    const value = searchInput.value.trim();

    if (value) {
      const theValue = encodeURIComponent(value).replace(/%20/g, '+');
      window.location = `/${filmCategory}?q=` + theValue;
    }
  };

  function hamburger() {
    document.getElementById('hamburger').onclick = () => {
      if (!supernavContainer.classList.contains('mobile')) {
        supernavContainer.className += ' mobile';
        searchBox.classList.remove('mobile');
      } else {
        supernavContainer.classList.remove('mobile');
      }
    };
  }
}

function init() {
  getGenre('movie');
  getGenre('tv');
  addScroll();
  createHeader();
  searchButton();
}

export {init, getGenre, movieGenre, tvGenre};
