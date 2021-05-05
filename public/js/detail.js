import {generateDetailFilmUrl, handleGeneralError, getImagePath} from './at.js';
import {getProfile, filmCategory} from './util.js';

let gettingWL = false;
const watchlistedIcon = 'fa-bookmark';
const unwatchlistedIcon = 'fa-bookmark-o';

function getDetailMovie() {
  let movieId;
  const reqArray = location.pathname.replace(/\/$/, '').split('/');
  movieId = reqArray[reqArray.length - 1];

  fetch(
    generateDetailFilmUrl(filmCategory, movieId) +
      '?append_to_response=credits,videos'
  )
    .then((response) => response.json())
    .then((film) => {
      if (film.status_code) {
        alert(film.status_message);
      } else {
        let movieTitle = film.title;
        let releaseDate = getReleaseDate(film.release_date);
        let runtime = film.runtime;

        const genre = [];
        for (let i = 0; i < film.genres.length; i++) {
          const genreList = film.genres[i];

          if (i < film.genres.length && i != 0) {
            genre.push(' ' + genreList.name);
          } else {
            genre.push(genreList.name);
          }
        }

        let directors = [];
        for (let i = 0; i < film.credits.crew.length; i++) {
          const theDirector = film.credits.crew[i];

          while (theDirector.job == 'Director') {
            directors.push(theDirector.name);
            break;
          }
        }
        if (!directors.length) {
          directors = film.created_by
            ? getCreators(film.created_by)
            : 'Unknown';
        } else {
          let finalDirectors = '';
          for (let i = 0; i < directors.length; i++) {
            if (i < directors.length - 1) {
              finalDirectors += directors[i] + ', ';
            } else {
              finalDirectors += directors[i];
            }
          }
          directors =
            finalDirectors != '' ? finalDirectors : 'Unknown Directors';
        }

        const posterPath = getImagePath(film.poster_path, 'poster', true);
        const backdropPath = getImagePath(film.backdrop_path, 'backdrop', true);

        const trailerCode = film.videos?.results[0]?.key;
        const trailer = trailerCode
          ? `https://youtube.com/watch?v=${trailerCode}`
          : '';
        const trailerElem =
          trailer != ''
            ? `<div id="btn-trailer" class="detail-action"><a href="${trailer}" target="_blank" class="color-secondary"><i class="fa fa-play-circle fa-2x"></i></a></div>`
            : '';

        let theCast = '';
        for (let i = 0; i < film.credits.cast.length; i++) {
          const castList = film.credits.cast[i];
          const castElem = `<div class="cast"><img class="cast-image" src="${getImagePath(
            castList.profile_path,
            'cast'
          )}"><div class="cast-name">${
            castList.name
          }</div><div class="cast-character">${castList.character}</div></div>`;
          theCast += castElem;
        }
        const castElem =
          theCast != ''
            ? `<li class="list-group-item"><strong>Cast:</strong><br><div class="casts">${theCast}</div></li>`
            : '';

        if (filmCategory == 'tv') {
          movieTitle = film.name;
          releaseDate =
            getReleaseDate(film.first_air_date, false) +
            ' - ' +
            getReleaseDate(film.last_air_date, false);
          runtime = getEpisodeRuntime(film.episode_run_time);
        }
        if (runtime == 0) {
          runtime = 'Unknown';
        } else {
          runtime += ' minutes';
        }

        setView(
          posterPath,
          movieTitle,
          trailerElem,
          runtime,
          genre,
          filmCategory,
          releaseDate,
          directors,
          castElem,
          film
        );
        getWL(film);
        configure(film);
      }
    })
    .catch(handleGeneralError);
}

function setView(
  posterPath,
  movieTitle,
  trailerElem,
  runtime,
  genre,
  filmCategory,
  releaseDate,
  directors,
  castElem,
  film
) {
  const mainField = `
<div class="row">
    <div class="col-md-4">
        <img src="${posterPath}" class="poster">
    </div>
    <div class="col-md-7">
        <div id="top-detail">
            <div id="detail-title">
                <h2>${movieTitle}</h2>
            </div>
            ${trailerElem}
            <div id="btn-watchlist" class="hidden detail-action color-secondary">
                <i id="ic-watchlist" class="fa fa-bookmark-o fa-2x pointer"></i>
            </div>
        </div>
        <div>
            <ul class="list-group">
                <li class="list-group-item"><strong>Runtime:</strong> ${runtime}</li>
                <li class="list-group-item"><strong>Genre:</strong> ${genre}</li>
                <li class="list-group-item"><strong>${
                  filmCategory == 'movie' ? 'Released' : 'Air Date'
                }:</strong> ${releaseDate}</li>
                <li class="list-group-item"><strong>Rating: <i class="fa fa-star mr5"></i></strong> ${
                  film.vote_average
                }</li>
                <li class="list-group-item"><strong>${
                  filmCategory == 'movie' ? 'Directors' : 'Creator'
                }:</strong> ${directors}</li>
                ${castElem}
            </ul>
        </div>
    </div>
</div>
    `;

  const overviewField = `
    <div id="overview">
        <h3>Overview</h3>
        <p>
            ${film.overview}
        </p>
    </div>
    `;
  const output = mainField + overviewField;
  document.title = movieTitle + ' | Movie Catalogue';
  document.getElementById('movie').innerHTML = output;
}

function configure(film) {
  const watchlistButton = document.getElementById('btn-watchlist');
  watchlistButton.onclick = function () {
    watchlist(film);
  };

  const slider = document.querySelector('.casts');
  let isDown = false;
  let startX;
  let scrollLeft;

  if (slider) {
    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      slider.classList.add('active');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
      isDown = false;
      slider.classList.remove('active');
    });
    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.classList.remove('active');
    });
    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = x - startX;
      slider.scrollLeft = scrollLeft - walk;
    });
  }
}

function getEpisodeRuntime(runtimes) {
  if (runtimes.length > 1) {
    return `${runtimes[0]} - ${runtimes[runtimes.length - 1]}`;
  } else if (runtimes.length == 1) {
    return runtimes[0];
  }
  return 0;
}

function getCreators(creators) {
  let finalCreators = '';
  let creatorsCount = 1;
  creators.forEach((creator) => {
    if (creatorsCount < creators.length) {
      creatorsCount += 1;
      finalCreators += creator.name + ', ';
    } else {
      finalCreators += creator.name;
    }
  });
  return finalCreators;
}

function getReleaseDate(data, day = true) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const releaseDate = new Date(data);
  const dayName = day ? days[releaseDate.getDay()] + ', ' : '';
  return (
    dayName +
    months[releaseDate.getMonth()] +
    ' ' +
    releaseDate.getDate() +
    ', ' +
    releaseDate.getFullYear()
  );
}

async function getWL(film) {
  const profile = await getProfile();
  const profileId = profile.userId;
  if (!profileId) return;
  gettingWL = true;
  try {
    const btnWatchlist = document.getElementById('btn-watchlist');

    const body = {
      lineUId: profileId,
      filmId: film.id,
    };

    const response = await fetch(`/getWLById`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    });

    if (response) {
      gettingWL = false;
      btnWatchlist.classList.remove('hidden');
    }

    if (response.status == 200) {
      const likeIcon = document.getElementById('ic-watchlist');
      likeIcon.classList.remove(unwatchlistedIcon);
      likeIcon.classList.add(watchlistedIcon);
    }
  } catch (error) {
    gettingWL = false;
  }
}

async function watchlist(film) {
  const profile = await getProfile();
  const profileId = profile.userId;
  const profileName = profile.displayName;
  if (!profileId) return;
  try {
    if (!gettingWL) {
      gettingWL = true;
      const body = {
        lineUId: profileId,
        name: profileName,
        movie: film,
      };
      const response = await fetch('/addWL', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      });

      const likeIcon = document.getElementById('ic-watchlist');
      if (response) gettingWL = false;
      if (response.status == 200) {
        likeIcon.classList.remove(unwatchlistedIcon);
        likeIcon.classList.add(watchlistedIcon);
      } else if (response.status == 201) {
        likeIcon.classList.remove(watchlistedIcon);
        likeIcon.classList.add(unwatchlistedIcon);
      }
    }
  } catch (error) {
    gettingWL = false;
  }
}

export default getDetailMovie;
