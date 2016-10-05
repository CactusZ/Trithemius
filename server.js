//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//

var express = require('express');

var steganograph = require('./server_modules/steganograph');
var fileController = require('./server_modules/fileController');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var app = express();

app.use(express.static(__dirname + '/client'));

app.get('/', function(req, res) {
    res.sendfile('index.html', {
        root: './client'
    });
});

app.use('/getresult', fileController);
app.use('/upload', steganograph);

app.listen(process.env.PORT);