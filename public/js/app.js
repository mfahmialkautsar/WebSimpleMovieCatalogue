import {getUpcomingFilms} from './home.js';
import {getHome, getFilms, getWatchlist} from './films.js';
import getDetailMovie from './detail.js';
import {init} from './layout.js';
import {pathname, toTitleCase} from './util.js';

const path = pathname.split('/');

init();
switch (path[1]) {
  case undefined:
    getUpcomingFilms();
    getHome();
    break;
  case 'movie':
  case 'tv':
    if (path[2]) {
      getDetailMovie();
    } else {
      document.title = `${toTitleCase(path[1])} | Movie Catalogue`;
      getFilms();
    }
    break;
  case 'watchlist':
    getWatchlist();
    document.title = 'Watchlist | Movie Catalogue';
    break;
  default:
    break;
}
