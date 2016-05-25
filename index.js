

var PORT = process.env.PORT || 9001;

var express = require('express'),
  logger = require('morgan'),
  path = require('path'),
  http = require('http');

var app = express();

app.use(logger('dev'));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static(path.join(__dirname, 'dist', 'whitetile')));

var server = http.createServer(app);

server.listen(PORT, function () {
  console.log('listening on ', server.address().port);
});
