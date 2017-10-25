// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

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

// Set our api routes
//app.use('/api', api);

/**
* Get port from environment and store in Express.
*/
const port = process.env.PORT || '3000';
app.set('port', port);

/**
* Create HTTP server.
*/
const server = http.createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  //console.log('user connected');
  
  socket.on('disconnect', function(){
    //console.log('user disconnected');
  });
  
  // socket.on('add-message', (message) => {
  //   io.emit('message', {type:'new-message', text: message});    
  // });
});

require('./server/routes/design.routes')(app, io);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

/**
* Listen on provided port, on all network interfaces.
*/
server.listen(port, () => console.log(`API running on localhost:${port}`));