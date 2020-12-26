import { getUpcomingFilms, setCarousel } from "./home.js";
import { getHome, getFilms, getWatchlist } from "./films.js";
import getDetailMovie from "./detail.js";
import * as util from "./utility.js";

const pathname = location.pathname.replace(/\/$/, "");
const path = pathname.split("/");

switch (path[1]) {
    case undefined:
        getUpcomingFilms(setCarousel);
        getHome();
        break;
    case "movie":
    case "tv":
        if (path[2]) {
            getDetailMovie();
        } else {
            getFilms();
        }
        break;
    case "watchlist":
        getWatchlist();
        break;
    default:
        break;
}
