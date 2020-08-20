var container = document.querySelector('.container');
const body = document.body;
const searchSubmit = document.querySelector('#search-submit');
const searchInput = document.querySelector('#movie-input');
const moviesContainer = document.querySelector('#movies-container');
const searchButton = document.querySelector('#search');
const nextPageButton = document.getElementById('next-page');
const prevPageButton = document.getElementById('prev-page');
let pageNumber = document.getElementById('page-input');
let totalPagesNumber = document.getElementById('total-pages');
let page;
let totalPages;
let query;
let movieTitle;
let imdbLink;
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll < 0.01) {
        body.classList.remove('scroll-up');
        body.classList.remove('scroll-down');
        return;
    }

    if (currentScroll > lastScroll && !body.classList.contains('scroll-down')) {
        body.classList.remove('scroll-up');
        body.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && body.classList.contains('scroll-down')) {
        body.classList.remove('scroll-down');
        body.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
})

function createImageContainer(imageUrl, id, title, year, vote_average) {
    const tempDiv = document.createElement('div');
    tempDiv.setAttribute('class', 'imageContainer');
    tempDiv.setAttribute('data-id', id);

    const movieElement = `
        <a href="movie.html?id=${id}">
            <div id="rating">
                <i class="fa fa-star mr5"></i>
                ${vote_average}</div>
            <img src="${imageUrl}" alt="${title}" data-movie-id="${id}">
            <span class="mli-info"><div id="title">${title} (${year})</div></span>
        </a>
    `;
    tempDiv.innerHTML = movieElement;

    return tempDiv;
}

function createSectionHeader(title) {
    const header = document.createElement('h3');
    header.innerHTML = title;

    return header;
}

function renderMovies(data) {
    moviesContainer.innerHTML = '';
    const moviesBlock = generateMoviesBlock(data);
    const header = createSectionHeader(this.title);
    moviesBlock.insertBefore(header, moviesBlock.firstChild);
    moviesContainer.appendChild(moviesBlock);

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
    }

    nextPageButton.onclick = function (event) {
        event.preventDefault();
        if (page < totalPages) {
            page++;
            jumpToPage();
        }
    }

    var prevButtonStyle = prevPageButton.style;
    if (page <= 1) {
        prevButtonStyle.display = 'none';
    } else {
        prevButtonStyle.display = 'block'
    }

    var nextButtonStyle = nextPageButton.style;
    if (page >= totalPages) {
        nextButtonStyle.display = 'none';
    } else {
        nextButtonStyle.display = 'block';
    }

    if (totalPages == 0) {
        pageNumber.disabled = true;
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
        window.location = '/?p=' + page;
    }
}

function goTo(number) {
    if (event.key === 'Enter') {
        page = number.value;
        jumpToPage();
    }
}

function generateMoviesBlock(data) {
    const movies = data.results;
    const section = document.createElement('section');
    section.setAttribute('class', 'section');

    for (let i = 0; i < movies.length; i++) {
        const { poster_path, id, title, release_date, vote_average } = movies[i];
        var releaseDate = new Date(release_date);
        var year = releaseDate.getFullYear();

        if (poster_path) {
            const imageUrl = MOVIE_DB_IMAGE_ENDPOINT + poster_path;

            const imageContainer = createImageContainer(imageUrl, id, title, year, vote_average);
            section.appendChild(imageContainer);
        }
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

searchButton.onclick = function () {
    var style = document.getElementById('search-box').style;
    if (style.display == 'block') {
        style.display = 'none';
        container.style.marginTop = "50px";
    } else {
        style.display = 'block';
        container.style.marginTop = "100px";
        document.getElementById('movie-input').focus();
    }
}

searchSubmit.onclick = function (event) {
    event.preventDefault();
    const value = searchInput.value.trim()

    if (value) {
        var theValue = encodeURIComponent(value).replace(/%20/g, '+');
        window.location = '/?q=' + theValue;
    }
}

function getDetailMovie() {
    var urlParams = new URLSearchParams(location.search);
    let movieId;
    movieId = urlParams.get('id');

    fetch(generateMovieDBUrl(`/movie/${movieId}`) + "&append_to_response=credits")
        .then((response) => response.json())
        .then((movie) => {

            if (movie.status_code) {
                alert(movie.status_message)
            } else {
                movieTitle = movie.title;

                var genre = [];
                for (let i = 0; i < movie.genres.length; i++) {
                    const genreList = movie.genres[i];

                    if (i < movie.genres.length && i != 0) {
                        genre.push(" " + genreList.name);
                    } else {
                        genre.push(genreList.name);
                    }
                }

                var cast = [];
                for (let i = 0; i < movie.credits.cast.length; i++) {
                    const castList = movie.credits.cast[i];
                    if (i < 5) {
                        if (i < movie.credits.cast.length && i != 0) {
                            cast.push(" " + castList.name);
                        } else {
                            cast.push(castList.name);
                        }
                    } else {
                        cast.push(" etc.");
                        break;
                    }
                }

                var director = [];
                for (let i = 0; i < movie.credits.crew.length; i++) {
                    const theDirector = movie.credits.crew[i];

                    while (theDirector.job == "Director") {
                        director.push(theDirector.name);
                        break;
                    }
                }

                imdbLink = `http://imdb.com/title/${movie.imdb_id}`;

                let output = `
                <div class="row">
    <div class="col-md-4">
        <img src="${MOVIE_DB_IMAGE_ENDPOINT + movie.poster_path}" class="thumbnail">
    </div>
    <div class="col-md-7">
        <div id="top-detail">
            <div id="detail-title">
                <h2>${movieTitle}</h2>
            </div>
            <div id="detail-like" onclick="like();">
                <i class="fa fa-thumbs-up fa-2x"></i>
            </div>
        </div>
        <div>
            <ul class="list-group">
                <li class="list-group-item"><strong>Genre:</strong> ${genre}</li>
                <li class="list-group-item"><strong>Released:</strong> ${getReleaseDate(movie.release_date)}</li>
                <li class="list-group-item"><strong>Rating: <i class="fa fa-star mr5"></i></strong> ${movie.vote_average}</li>
                <li class="list-group-item"><strong>Director:</strong> ${director}</li>
                <li class="list-group-item"><strong>Cast:</strong> ${cast}</li>
            </ul>
        </div>
    </div>
</div>
<div id="overview">
    <h3>Overview</h3>
    <p>
        ${movie.overview}
    </p>
    <hr>
    <a href="${imdbLink}" target="_blank" class="btn btn-imdb">IMDB</a>
</div>
            `;

                document.title = movie.title + " - Movie Catalogue";
                $('#movie').html(output);
                startLiff();
            }
        })
        .catch((err) => {
            handleGeneralError(err);
        });
}

function getReleaseDate(data) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let releaseDate = new Date(data);
    var dayName = days[releaseDate.getDay()];
    return dayName + ", " + months[releaseDate.getMonth()] + " " + releaseDate.getDate() + ", " + releaseDate.getFullYear();
}

function load() {
    var urlParams = new URLSearchParams(location.search);
    page = urlParams.get('p');
    let searchKey = urlParams.get('q');
    if (searchKey) {
        var theValue = decodeURIComponent(searchKey);
        query = '?q=' + theValue;
        getSearchMovie(theValue, page);
    } else {
        getDiscoverMovies(page);
    }
    startLiff();
}

function like() {
    if (!liff.isInClient()) {
        sendAlertIfNotInClient();
    } else {
        liff.sendMessages([{
            'type': 'text',
            'text': "Hey! I like watching " + movieTitle + "! " + "Check it here " + imdbLink
        }]).then(function () {
            alert('You like it!');
        }).catch(function (error) {
            alert('Oops, ' + error);
        });
    }
}

function handleGeneralError(error) {
    alert(error.message);
}