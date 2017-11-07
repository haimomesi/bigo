// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const ws = require('ws');
const url = require('url');
//const fs = require('fs');

//auth
const cors = require('cors');

// Get our API routes
const api = require('./server/routes/api');

const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// app.get('/.well-known/acme-challenge/:fileId', function(req, res){
//     var p = path.join(__dirname, '/../../.well-known/acme-challenge/'+ req.params.fileId);
//     // var output = '';
//     // fs.readdirSync(testFolder).forEach(file => {
//     //   output += file;
//     // })
//     var r = fs.readFileSync(p).toString();
//     //res.sendFile(p, {dotfiles: 'allow'});
//     res.send(r);
// });

/**
* Get port from environment and store in Express.
*/
const port = process.env.PORT || '3000';
app.set('port', port);

/**
* Create HTTP server.
*/
const server = http.createServer(app);
server.setTimeout(240000);
const wss = new ws.Server({ server: server, clientTracking: true });

wss.on('connection', function connection(ws, req) {
  const params = url.parse(req.url, true).query;
  ws.socketId = params.socketId;
});

require('./server/routes/design.routes')(app, wss);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

/**
* Listen on provided port, on all network interfaces.
*/
server.listen(port, () => console.log(`API running on localhost:${port}`));