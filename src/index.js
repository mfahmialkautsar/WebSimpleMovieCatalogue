const port = process.env.PORT || 5000;
const http = require('http');
const routes = require('./routes');

const server = http.createServer(routes);
server.listen(port);
