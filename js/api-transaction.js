const MOVIE_DB_ENDPOINT = 'https://api.themoviedb.org';
const MOVIE_DB_IMAGE_ENDPOINT = 'https://image.tmdb.org/t/p/w500';
const MOVIE_DB_API = 'YOUR_MOVIE_DB_API_GOES_HERE';

function requestMovies(url, onComplete, onError) {
    fetch(url)
        .then((response) => response.json())
        .then(onComplete)
        .catch(onError);
}

function generateMovieDBUrl(path, page = 1) {
    const url = `${MOVIE_DB_ENDPOINT}/3${path}?page=${page}&api_key=${MOVIE_DB_API}`;
    return url;
}

function getDiscoverMovies(page) {
    const url = generateMovieDBUrl('/discover/movie', page);
    const render = renderMovies.bind({ title: 'Discover Movies' })
    requestMovies(url, render, handleGeneralError);
}

function getSearchMovie(value, page) {
    const url = generateMovieDBUrl('/search/movie', page) + '&query=' + value;
    const render = renderMovies.bind({ title: 'Showing: ' + value })
    var inputId = document.getElementById('movie-input');
    inputId.value = value;
    requestMovies(url, render, handleGeneralError);
}