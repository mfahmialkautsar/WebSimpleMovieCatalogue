const fs = require('fs');
const https = require('https');
const path = require('path');
const db = require('./db');
const LIFF_ID = process.env.LIFF_ID;
const MOVIE_DB_ENDPOINT = 'https://api.themoviedb.org';
const MOVIE_DB_API = process.env.TMDB_API;

function getDetailMovie(category, id) {
	return new Promise((resolve, reject) => {
		https
			.get(generateDetailMovieUrl(category, id), (res) => {
				let data = '';

				res.on('data', (chunk) => {
					data += chunk;
				});
				res.on('end', () => {
					resolve(data);
				});
			})
			.on('error', reject);
	});
}

function generateMovieUrl(content) {
	return `${MOVIE_DB_ENDPOINT}/3/${content}?api_key=${MOVIE_DB_API}`;
}

function generateDetailMovieUrl(category, id) {
	return generateMovieUrl(`${category}/${id}`);
}

async function serve(req, res) {
	function send(code) {
		res.writeHead(code);
		res.end();
	}

	switch (req.method) {
		case 'GET':
			switch (req.url) {
				case '/send-id':
					res.end(`{"id": "${LIFF_ID}"}`);
					break;
				default:
					let filePath = req.url.replace(/^\/+/, '').replace(/\/+$/, '');

					const reqArray = filePath.split('/');
					const lastPath = reqArray[reqArray.length - 1];

					const idPattern = /\d+$/;
					// const queryPattern = /\/?\?q=.*/;
					// const genrePattern = /\/?\?genre=.*/;
					// const pagePattern = /\/?\?p=\d*/;

					const id = lastPath.match(idPattern);
					const params = filePath.match(/\/?\?.*/);
					// const query = filePath.match(queryPattern);
					// const genre = filePath.match(genrePattern);
					// const page = filePath.match(pagePattern);

					const public = path.join(__dirname, 'public/');

					switch (filePath) {
						case '':
							filePath = 'index.html';
							break;
						case 'watchlist':
						case 'movie':
						case 'movie' + params:
						case 'tv':
						case 'tv' + params:
							filePath = 'film.html';
							break;
						case 'movie/' + id:
						case 'tv/' + id:
							filePath = 'detail.html';
							break;
						default:
							if (filePath.match(/\.html$/i)) {
								filePath = '404';
							} else if (req.url.match(/\/?code=.+/)) {
								filePath = 'index.html';
							}
							break;
					}
					filePath = public + filePath;

					const extname = String(path.extname(filePath)).toLowerCase();
					const mimeTypes = {
						'.html': 'text/html',
						'.js': 'text/javascript',
						'.css': 'text/css',
						'.json': 'application/json',
						'.png': 'image/png',
						'.jpg': 'image/jpg',
						'.gif': 'image/gif',
						'.svg': 'image/svg+xml',
						'.wav': 'audio/wav',
						'.mp4': 'video/mp4',
						'.woff': 'application/font-woff',
						'.ttf': 'application/font-ttf',
						'.eot': 'application/vnd.ms-fontobject',
						'.otf': 'application/font-otf',
						'.wasm': 'application/wasm',
					};

					const contentType = mimeTypes[extname] || 'application/octet-stream';

					fs.readFile(filePath, null, function (err, data) {
						if (err) {
							res.writeHead(404);
							res.write(err.code);
							res.end(data, 'utf-8');
						} else {
							res.writeHead(200, {
								'Content-Type': contentType,
							});
							res.end(data, 'utf-8');
						}
					});
					break;
			}

			break;
		case 'POST':
			let body;
			switch (req.url) {
				case '/getapik':
					res.end(MOVIE_DB_API);
					break;
				case '/addWL':
					body = '';
					req.on('data', (chunk) => (body += chunk));
					req.on('end', async () => {
						try {
							body = JSON.parse(body);
							const lineUId = body.lineUId;
							const name = body.name;
							const movie = body.movie;
							const newWL = await db.addWL(lineUId, name, movie);
							switch (newWL.command) {
								case 'INSERT':
									send(200);
									break;
								case 'DELETE':
									send(201);
									break;
								default:
									send(400);
									break;
							}
						} catch (error) {
							send(400);
						}
					});
					break;
				case '/getWLs':
					body = '';
					req.on('data', (chunk) => (body += chunk));
					req.on('end', async () => {
						try {
							body = JSON.parse(body);
							const lineuid = body.lineUId;
							const movies = await db.getAll(lineuid);
							if (movies) {
								resMovies = [];
								if (movies.length > 0) {
									movies.forEach((movie) => {
										getDetailMovie(movie.category, movie.filmid)
											.then((movie) => {
												resMovies.push(movie);

												if (resMovies.length == movies.length) {
													res.writeHead(200);
													res.write(`{"results": [${resMovies}]}`);
													res.end();
												}
											})
											.catch(() => {
												send(204);
											});
									});
								} else {
									res.write(`{"results": [${resMovies}]}`);
									send(200);
								}
							} else {
								send(300);
							}
						} catch (error) {
							send(400);
						}
					});
					break;
				case '/getWLById':
					body = '';
					req.on('data', (chunk) => (body += chunk));
					req.on('end', async () => {
						try {
							body = JSON.parse(body);
							const lineuid = body.lineUId;
							const filmid = body.filmId;
							const movie = await db.get(lineuid, filmid);
							if (movie) {
								res.writeHead(200);
							} else {
								res.writeHead(300);
							}
						} catch (error) {
							res.writeHead(400);
						}
						res.end();
					});
					break;
				default:
					send(400);
					break;
			}
			break;
		default:
			res.end();
			break;
	}
}

module.exports = { serve };
