const {getLineId, getTmdb} = require('./controllers/data');
const page = require('./controllers/page');
const {getById, getAll, add} = require('./controllers/watchlist');

async function routes(req, res) {
  switch (req.method) {
    case 'GET':
      switch (req.url) {
        case '/send-id':
          getLineId(req, res);
          break;
        case String(req.url.match(/\/tmdb\/.+/)):
          getTmdb(req, res);
          break;
        default:
          page(req, res);
          break;
      }

      break;
    case 'POST':
      switch (req.url) {
        case '/getapik':
          res.end(MOVIE_DB_API);
          break;
        case '/addWL':
          add(req, res);
          break;
        case '/getWLs':
          getAll(req, res);
          break;
        case '/getWLById':
          getById(req, res);
          break;
        default:
          res.writeHead(400);
          res.end();
          break;
      }
      break;
    default:
      res.end();
      break;
  }
}

module.exports = routes;
