const port = process.env.PORT || 5000;
const http = require('http');
const { serve } = require('./web');

const server = http.createServer(serve);
server.listen(port);
