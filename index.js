const port = process.env.PORT || 5000;
const http = require("http");
const fs = require("fs");
const path = require("path");
const db = require("./db");
const fetch = require("node-fetch");
const MOVIE_DB_ENDPOINT = "https://api.themoviedb.org";
const MOVIE_DB_API = process.env.TMDBAPI;
const LIFFID = process.env.LIFFID;

function generateMovieUrl(content) {
    const url = `${MOVIE_DB_ENDPOINT}/3/${content}?api_key=${MOVIE_DB_API}`;
    return url;
}

function generateDetailMovieUrl(category, id) {
    return generateMovieUrl(`${category}/${id}`);
}

const server = http.createServer(async (req, res) => {
    switch (req.method) {
        case "GET":
            if (req.url == "/getapik") {
                res.end(MOVIE_DB_API);
                break;
            }
            if (req.url == "/send-id") {
                res.end(`{"id": "${LIFFID}"}`);
                break;
            }

            let filePath = "." + req.url.replace(/\/$/, "").toLowerCase();
            if (filePath == ".") {
                filePath = "./";
            }

            const reqArray = req.url.replace(/\/$/, "").split("/");
            const lastPath = reqArray[reqArray.length - 1];

            const pattern = /\/.*\//;
            const idPattern = /\d+\/?/;
            const queryPattern = /\?q=.*/;
            const genrePattern = /\?genre=.*/;
            const pagePattern = /\?p=\d*/;

            const id = lastPath.match(idPattern);
            const query = filePath.match(queryPattern);
            const genre = filePath.match(genrePattern);
            const page = filePath.match(pagePattern);

            switch (filePath) {
                case "./":
                    filePath = "./public/index.html";
                    break;
                case "./watchlist":
                case "./movie":
                case "./movie" + query:
                case "./movie" + genre:
                case "./movie" + page:
                case "./tv":
                case "./tv" + query:
                case "./tv" + genre:
                case "./tv" + page:
                    filePath = "./public/film.html";
                    break;
                case "./movie/" + id:
                case "./tv/" + id:
                    filePath = "./public/detail.html";
                    break;
                default:
                    if (filePath.match(/\.html/i)) {
                        filePath = "";
                    } else if (req.url.match(/\/?code=.+/)) {
                        filePath = "./public/index.html";
                    }
                    break;
            }

            var extname = String(path.extname(filePath)).toLowerCase();
            var mimeTypes = {
                ".html": "text/html",
                ".js": "text/javascript",
                ".css": "text/css",
                ".json": "application/json",
                ".png": "image/png",
                ".jpg": "image/jpg",
                ".gif": "image/gif",
                ".svg": "image/svg+xml",
                ".wav": "audio/wav",
                ".mp4": "video/mp4",
                ".woff": "application/font-woff",
                ".ttf": "application/font-ttf",
                ".eot": "application/vnd.ms-fontobject",
                ".otf": "application/font-otf",
                ".wasm": "application/wasm",
            };

            var contentType = mimeTypes[extname] || "application/octet-stream";

            fs.readFile(filePath, null, function (err, data) {
                if (err) {
                    res.writeHead(404);
                    res.write(err.code);
                    res.end(data, "utf-8");
                } else {
                    res.writeHead(200, {
                        "Content-Type": contentType,
                    });
                    res.end(data, "utf-8");
                }
            });
            break;
        case "POST":
            let body;
            switch (req.url) {
                case "/addWL":
                    body = "";
                    req.on("data", (chunk) => (body += chunk));
                    req.on("end", async () => {
                        try {
                            body = JSON.parse(body);
                            const lineUId = body.lineUId;
                            const name = body.name;
                            const movie = body.movie;
                            const newWL = await db.addWL(lineUId, name, movie);
                            switch (newWL.command) {
                                case "INSERT":
                                    res.writeHead(200);
                                    res.end();
                                    break;
                                case "DELETE":
                                    res.writeHead(201);
                                    res.end();
                                    break;
                                default:
                                    res.writeHead(400);
                                    res.end();
                                    break;
                            }
                        } catch (error) {
                            res.writeHead(400);
                            res.end();
                        }
                    });
                    break;
                case "/getWLs":
                    body = "";
                    req.on("data", (chunk) => (body += chunk));
                    req.on("end", async () => {
                        try {
                            body = JSON.parse(body);
                            const lineuid = body.lineUId;
                            const movies = await db.getAll(lineuid);
                            if (movies) {
                                resMovies = [];
                                if (movies.length > 0) {
                                    movies.forEach((movie) => {
                                        fetch(
                                            generateDetailMovieUrl(
                                                movie.category,
                                                movie.filmid
                                            )
                                        )
                                            .then((response) => response.json())
                                            .then((movie) => {
                                                resMovies.push(
                                                    JSON.stringify(movie)
                                                );

                                                if (
                                                    resMovies.length ==
                                                    movies.length
                                                ) {
                                                    res.writeHead(200);
                                                    res.write(
                                                        `{"results": [${resMovies}]}`
                                                    );
                                                    res.end();
                                                }
                                            });
                                    });
                                } else {
                                    res.writeHead(200);
                                    res.write(`{"results": [${resMovies}]}`);
                                    res.end();
                                }
                            } else {
                                res.writeHead(300);
                                res.end();
                            }
                        } catch (error) {
                            res.writeHead(400);
                            res.end();
                        }
                    });
                    break;
                case "/getWLById":
                    body = "";
                    req.on("data", (chunk) => (body += chunk));
                    req.on("end", async () => {
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
                    res.writeHead(400);
                    res.end();
                    break;
            }
            break;
        default:
            break;
    }
});
server.listen(port);
