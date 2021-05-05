const MOVIE_DB_IMAGE_ENDPOINT = 'https://image.tmdb.org/t/p/w500';
const MOVIE_DB_IMAGE_ENDPOINT_ORIGINAL = 'https://image.tmdb.org/t/p/original';

function getImagePath(path, type, original = false) {
	if (!path) {
		switch (type) {
			case 'poster':
				return 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg';
			case 'cast':
				return 'https://anara-africa.com/wp-content/uploads/2016/12/placeholder-profile-male.jpg';
			default:
				return '';
		}
	}
	if (original) return MOVIE_DB_IMAGE_ENDPOINT_ORIGINAL + path;
	return MOVIE_DB_IMAGE_ENDPOINT + path;
}

function requestFilm(url, onComplete, onError) {
	fetch(url)
		.then((response) => response.json())
		.then(onComplete)
		.then()
		.catch(onError);
}

function postFilm(url, body, onComplete, onError) {
	fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	})
		.then((response) => response.json())
		.then(onComplete)
		.then()
		.catch(onError);
}

function generateFilmUrl(content) {
	return `/tmdb/${content}`;
}

function generateDetailFilmUrl(category, id) {
	return generateFilmUrl(`${category}/${id}`);
}

function generateFilmListUrl(path, page, addition = '') {
	return generateFilmUrl(`${path}`) + `&page=${page}${addition}`;
}

function generateFilmsByGenreUrl(category, genre_id, page) {
	return (
		(generateFilmListUrl(`${category}/popular`, page)) +
		'&with_genres=' +
		genre_id
	);
}

function generateListGenreUrl(category) {
	return generateFilmUrl(`genre/${category}/list`);
}

function getPopularFilms(renderFilms, category, page, i = 0) {
	let topTitle;
	if (category == 'movie') {
		topTitle = 'Movies';
	} else {
		topTitle = 'TV Shows';
	}
	const url = generateFilmListUrl(`${category}/popular`, page);
	const render = renderFilms.bind({ title: `Popular ${topTitle}` }, i);
	requestFilm(url, render, handleGeneralError);
}

function getUpcomingFilms(render, page = 1) {
	const category = 'movie';
	let topTitle;
	if (category == 'movie') {
		topTitle = 'Movies';
	} else {
		topTitle = 'TV Shows';
	}
	const url = generateFilmListUrl(`${category}/upcoming`, page);
	requestFilm(url, render.bind(topTitle), 'handleGeneralError');
}

function getWatchlistMovies(renderFilms, lineUId) {
	const url = `/getWLs`;
	const body = {
		lineUId: lineUId,
	};
	const render = renderFilms.bind({ title: 'Watchlist' }, 0);
	postFilm(url, body, render, handleGeneralError);
}

function getSearchFilm(renderFilms, category, value, page) {
	const url = generateFilmListUrl(
		`search/${category}`,
		page,
		'&query=' + value
	);
	const render = renderFilms.bind({ title: 'Showing: ' + value }, 0);
	const inputId = document.getElementById('movie-input');
	inputId.value = value;
	requestFilm(url, render, handleGeneralError);
}

function getFilmsByGenre(renderFilms, category, genre_id, genre_name, page) {
	const url = generateFilmsByGenreUrl(category, genre_id, page);
	const render = renderFilms.bind({ title: genre_name }, 0);
	requestFilm(url, render, handleGeneralError);
}

function getHomeScreen(renderFilms) {
	getPopularFilms(renderFilms, 'movie', 1, 0);
	getPopularFilms(renderFilms, 'tv', 1, 1);
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
	generateDetailFilmUrl,
	generateListGenreUrl,
	getPopularFilms,
	getWatchlistMovies,
	getSearchFilm,
	getFilmsByGenre,
	getHomeScreen,
	getUpcomingFilms,
	handleGeneralError,
	getImagePath,
};
