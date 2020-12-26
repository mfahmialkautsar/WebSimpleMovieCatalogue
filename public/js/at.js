const MOVIE_DB_ENDPOINT = "https://api.themoviedb.org";
const MOVIE_DB_IMAGE_ENDPOINT = "https://image.tmdb.org/t/p/w500";
const MOVIE_DB_IMAGE_ENDPOINT_ORIGINAL = "https://image.tmdb.org/t/p/original";
let MOVIE_DB_API;
const getAPIKey = async () => {
    if (!MOVIE_DB_API) {
        await fetch("/getapik").then(
            async (response) => (MOVIE_DB_API = await response.text())
        );
    }
    return MOVIE_DB_API;
};

async function requestFilm(url, onComplete, onError) {
    await fetch(url)
        .then((response) => response.json())
        .then(onComplete)
        .catch(onError);
}

function postFilm(url, body, onComplete, onError) {
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
        .then((response) => response.json())
        .then(onComplete)
        .catch(onError);
}

async function generateFilmUrl(content) {
    return `${MOVIE_DB_ENDPOINT}/3/${content}?api_key=${await getAPIKey()}`;
}

async function generateDetailFilmUrl(category, id) {
    return await generateFilmUrl(`${category}/${id}`);
}

async function generateFilmListUrl(path, page) {
    return (await generateFilmUrl(`${path}`)) + `&page=${page}`;
}

async function generateFilmsByGenreUrl(category, genre_id, page) {
    return (
        (await generateFilmListUrl(`${category}/popular`, page)) +
        "&with_genres=" +
        genre_id
    );
}

async function generateListGenreUrl(category) {
    return await generateFilmUrl(`genre/${category}/list`);
}

async function getPopularFilms(renderFilms, category, page, i = 0) {
    let topTitle;
    if (category == "movie") {
        topTitle = "Movies";
    } else {
        topTitle = "TV Shows";
    }
    const url = await generateFilmListUrl(`${category}/popular`, page);
    const render = await renderFilms.bind({ title: `Popular ${topTitle}` }, i);
    requestFilm(url, render, handleGeneralError);
}

async function getUpcomingFilms(render, page = 1) {
    const category = "movie";
    let topTitle;
    if (category == "movie") {
        topTitle = "Movies";
    } else {
        topTitle = "TV Shows";
    }
    const url = await generateFilmListUrl(`${category}/upcoming`, page);
    requestFilm(url, render.bind(), "handleGeneralError");
}

function getWatchlistMovies(renderFilms, profile) {
    const url = `/getWLs`;
    const body = {
        lineUId: profile.userId,
    };
    (async () => {
        const render = await renderFilms.bind({ title: "Watchlist" }, 0);
        postFilm(url, body, render, handleGeneralError);
    })();
}

async function getSearchFilm(renderFilms, category, value, page) {
    const url =
        (await generateFilmListUrl(`search/${category}`, page)) +
        "&query=" +
        value;
    const render = await renderFilms.bind({ title: "Showing: " + value }, 0);
    const inputId = document.getElementById("movie-input");
    inputId.value = value;
    await requestFilm(url, render, handleGeneralError);
}

async function getFilmsByGenre(
    renderFilms,
    category,
    genre_id,
    genre_name,
    page
) {
    const url = await generateFilmsByGenreUrl(category, genre_id, page);
    const render = await renderFilms.bind({ title: genre_name }, 0);
    requestFilm(url, render, handleGeneralError);
}

async function getHomeScreen(renderFilms) {
    getPopularFilms(await renderFilms, "movie", 1, 0);
    getPopularFilms(await renderFilms, "tv", 1, 1);
}

function handleGeneralError(error) {
    // console.log(error);
    // container.innerHTML = "";
    // alert("Error! " + error.message);
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

export {
    postFilm,
    generateDetailFilmUrl,
    generateListGenreUrl,
    getPopularFilms,
    getWatchlistMovies,
    getSearchFilm,
    getFilmsByGenre,
    getHomeScreen,
    getUpcomingFilms,
    handleGeneralError,
    MOVIE_DB_IMAGE_ENDPOINT,
    MOVIE_DB_IMAGE_ENDPOINT_ORIGINAL,
};
