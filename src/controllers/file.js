const fs = require('fs');
const path = require('path');

function file(req, res) {
  let filePath = req.url.replace(/^\/+/, '').replace(/\/+$/, '');

  const reqArray = filePath.split('/');
  const lastPath = reqArray[reqArray.length - 1];

  const idPattern = /\d+$/;
  // const queryPattern = /\/?\?q=.*/;
  // const genrePattern = /\/?\?genre=.*/;
  // const pagePattern = /\/?\?p=\d*/;

  const idObj = lastPath.match(idPattern);
  const paramsObj = filePath.match(/\/?\?.+/);

  const id = idObj ? idObj[0] : '';
  const params = paramsObj ? paramsObj[0] : '';
  // const query = filePath.match(queryPattern);
  // const genre = filePath.match(genrePattern);
  // const page = filePath.match(pagePattern);

  const public = path.join(__dirname, '../..', 'public/');

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
}

module.exports = file;
