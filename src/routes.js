const {getLineId, getTmdb} = require('./controllers/data');
const file = require('./controllers/file');
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
          file(req, res);
          break;
      }

      break;
    case 'POST':
      switch (req.url) {
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
