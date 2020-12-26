import {
    getFilmsByGenre,
    getPopularFilms,
    getWatchlistMovies,
    getHomeScreen,
    getSearchFilm,
    MOVIE_DB_IMAGE_ENDPOINT,
} from "./at.js";
import {
    getGenre,
    filmCategory as fc,
    movieGenre,
    tvGenre,
} from "./utility.js";
import { getProfile } from "./liff.js";

const moviesContainers = document.getElementsByClassName("container-movies");
const nextPageButton = document.getElementById("next-page");
const prevPageButton = document.getElementById("prev-page");
const pageNumber = document.getElementById("page-input");
const totalPagesNumber = document.getElementById("total-pages");
let filmCategory = fc;
let pathname = location.pathname.replace(/\/$/, "");
let path = pathname.split("/");
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
    const imageUrl = film.poster_path
        ? MOVIE_DB_IMAGE_ENDPOINT + film.poster_path
        : "https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg";

    const tempDiv = document.createElement("div");
    tempDiv.setAttribute("class", "imageContainer");
    tempDiv.setAttribute("data-id", filmId);

    let category = film.title ? "movie" : "tv";

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
    const header = document.createElement("h3");
    header.innerHTML = title;
    header.style.display = "inline-block";

    let headerLink;
    if (path[1] == undefined) {
        headerLink = document.createElement("a");
        headerLink.href = title.toLowerCase().includes("movies")
            ? "/movie"
            : "tv";
        headerLink.setAttribute("class", "nodecor-link");
        headerLink.insertBefore(header, headerLink.firstChild);
        return headerLink;
    }

    return header;
}

async function renderFilms(i = 0, data) {
    moviesContainers[i].innerHTML = "";
    if (popular && (!page || page == 1)) {
        document
            .querySelector(".container-movies")
            .appendChild(await createGenresShow());
    }
    const moviesBlock = generateMoviesBlock(data);
    const header = createSectionHeader(this.title);
    moviesBlock.insertBefore(header, moviesBlock.firstChild);
    searchCategory
        ? moviesBlock.insertBefore(
              searchCategory,
              moviesBlock.firstChild.nextSibling
          )
        : null;
    moviesContainers[i].appendChild(moviesBlock);

    goToPage(data);
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
        window.location = query + "&p=" + page;
    } else {
        const genre = new URLSearchParams(location.search).get("genre");
        if (genre) {
            window.location = `/${filmCategory}?genre=${genre}&p=${page}`;
        } else {
            window.location = `/${filmCategory}?p=${page}`;
        }
    }
}

function goToPage(data) {
    const pageInput = document.getElementById("page-input");
    if (pageInput) {
        pageInput.addEventListener("keyup", function (event) {
            event.preventDefault();
            if (event.key === "Enter") {
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
            if (page >= 2) {
                page--;
                jumpToPage();
            }
        };

        nextPageButton.onclick = function (event) {
            event.preventDefault();
            if (page < totalPages) {
                page++;
                jumpToPage();
            }
        };

        const prevButtonStyle = prevPageButton.style;
        if (page <= 1) {
            prevButtonStyle.display = "none";
        } else {
            prevButtonStyle.display = "block";
        }

        const nextButtonStyle = nextPageButton.style;
        if (page >= totalPages) {
            nextButtonStyle.display = "none";
        } else {
            nextButtonStyle.display = "block";
        }

        if (totalPages == 0) {
            pageNumber.disabled = true;
        }
    }
}

function generateMoviesBlock(data) {
    const films = data.results;
    const section = document.createElement("section");
    section.setAttribute("class", "section");

    for (let i = 0; i < films.length; i++) {
        const film = films[i];
        const imageContainer = createImageContainer(film);
        section.appendChild(imageContainer);
    }

    const movieSectionAndContent = createMovieContainer(section);
    return movieSectionAndContent;
}

function createMovieContainer(section) {
    const movieElement = document.createElement("div");
    movieElement.setAttribute("class", "movie");
    movieElement.insertBefore(section, movieElement.firstChild);
    return movieElement;
}

async function getGenreName(id) {
    let genreName = "";
    await getGenre(filmCategory);
    let listGenre = movieGenre;
    if (filmCategory == "tv") {
        listGenre = tvGenre;
    }
    listGenre.forEach((genre) => {
        if (genre.id == id) {
            genreName = genre.name;
        }
    });
    return genreName;
}

async function getWatchlist() {
    document.getElementById("container-footer").style.display = "none";
    getWatchlistMovies(renderFilms, await getProfile());
}

async function getHome() {
    getHomeScreen(renderFilms);
}

async function createGenresShow() {
    await getGenre(filmCategory);
    const genreShow = document.createElement("div");
    genreShow.setAttribute("class", "container-genre");
    let genres = "";
    let theGenre = movieGenre;
    let genreCategory = "movie";
    if (location.pathname.includes("tv")) {
        theGenre = tvGenre;
        genreCategory = "tv";
    }
    theGenre.forEach((genre) => {
        const genreName = genre.name.toLowerCase();
        if (
            genreName == "documentary" ||
            genreName == "science fiction" ||
            genreName == "tv movie" ||
            genreName == "war & politics" ||
            genreName == "western"
        ) {
            return;
        }

        genres += `<a class="nodecor-link" href="/${genreCategory}?genre=${
            genre.id
        }"><div class="genre-label-item" style="background-image: url('/img/genre/${
            genreCategory + "/" + genreName.replaceAll(" ", "-") + ".jpg"
        }');"><span class="container-genre-text">${
            genre.name
        }</span></div></a>`;
    });
    genreShow.innerHTML = `<h3>Genres</h3><div class="genre-label">${genres}</div>`;
    return genreShow;
}

async function getFilms() {
    const urlParams = new URLSearchParams(location.search);
    page = urlParams.get("p") || 1;
    const genre = urlParams.get("genre");
    const searchKey = urlParams.get("q");
    if (searchKey) {
        const theValue = decodeURIComponent(searchKey);
        query = "?q=" + theValue;
        searchCategory = document.createElement("div");
        searchCategory.setAttribute("class", "search-filter");
        searchCategory.innerHTML = `<button id="search-movie" class="btn-filter">Movies</button> <button id="search-tv" class="btn-filter">TV Shows</button>`;
        await getSearchFilm(renderFilms, filmCategory, theValue, page);

        const activeButton = document.getElementById("search-" + filmCategory);
        activeButton.style.backgroundColor = "#010101";
        activeButton.disabled = true;
        document.getElementById("search-movie").onclick = function (e) {
            e.preventDefault();
            searchFilms("movie", query);
        };
        document.getElementById("search-tv").onclick = function (e) {
            e.preventDefault();
            searchFilms("tv", query);
        };
    } else {
        if (genre) {
            await getFilmsByGenre(
                renderFilms,
                filmCategory,
                genre,
                await getGenreName(genre),
                page
            );
        } else {
            popular = true;
            await getPopularFilms(renderFilms, filmCategory, page);
        }
    }
}

function searchFilms(category, query) {
    window.location = `/${category}${query}`;
}

export { renderFilms, getHome, getFilms, getWatchlist };
