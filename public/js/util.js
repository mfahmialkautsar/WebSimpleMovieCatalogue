import {getProfile} from './liff.js';

let pathname = location.pathname.replace(/\/$/, '');
let filmCategory;

if (pathname.includes('tv')) {
  filmCategory = 'tv';
} else {
  filmCategory = 'movie';
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export {toTitleCase, sleep, getProfile, pathname, filmCategory};
