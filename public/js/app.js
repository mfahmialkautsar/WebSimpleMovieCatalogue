import { getUpcomingFilms } from './home.js';
import { getHome, getFilms, getWatchlist } from './films.js';
import getDetailMovie from './detail.js';
import { init, pathname } from './utility.js';

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
			getFilms();
		}
		break;
	case 'watchlist':
		getWatchlist();
		break;
	default:
		break;
}
