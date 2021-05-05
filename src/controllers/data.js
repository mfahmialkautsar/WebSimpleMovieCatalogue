const https = require('https');
const LIFF_ID = process.env.LIFF_ID;
const MOVIE_DB_ENDPOINT = 'https://api.themoviedb.org';
const MOVIE_DB_API = process.env.TMDB_API;
const url = require('url');

function getLineId(_, res) {
  res.end(`{"id": "${LIFF_ID}"}`);
}

function generateMovieUrl(content) {
  const urlPath = url.parse(content, true);
  const reqQuery = urlPath.query;
  const pathName = urlPath.pathname;
  let resQuery = '';
  for (const [key, value] of Object.entries(reqQuery)) {
    resQuery += `&${key}=${value}`;
  }
  return `${MOVIE_DB_ENDPOINT}/3/${pathName}?api_key=${MOVIE_DB_API}${resQuery}`;
}

function getTmdb(req, res) {
  const tmdbReqObj = req.url.match(/\/tmdb\/.+/);
  const tmdbReq = tmdbReqObj ? tmdbReqObj[0].replace('/tmdb/', '') : '';
  https
    .get(generateMovieUrl(tmdbReq), (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        res.writeHead(200, {
          'Content-Type': 'application/json',
        });
        res.end(data);
      });
    })
    .on('error', res.end);
}

module.exports = {getLineId, getTmdb};
