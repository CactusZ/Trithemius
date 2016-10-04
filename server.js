//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var express = require('express');
var crypto = require('crypto');
const spawn = require('child_process').spawn;


var id = 0;
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

app.get('/getresult/*.wav', function(req, res) {
    console.log(req.originalUrl);
    res.download('results/' + req.originalUrl.split('/').pop());
});

app.post('/upload/retrieve', function(req, res) {

    var curid = ++id;
    console.log("POST request id = " + curid.toString());
    var objectType;

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload one file in a single request
    form.multiples = false;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/uploads');

    var resDir = path.join(__dirname, '/results');
    var fileCarrier;

    // every time a file has been uploaded successfully,
    // rename it to it's random hashed name
    form.on('file', function(field, file) {
        console.log('form field_TYPE=FILE field= ' + field + ' filename=' + file.name);
        var ext = '.' + file.name.split('.').pop();
        fileCarrier = crypto.createHash('md5').update(Math.random().toString()).digest('hex');
        fileCarrier = path.join(form.uploadDir, fileCarrier + ext);
        fs.rename(file.path, fileCarrier);
    });

    form.on('field', function(field, data) {
        console.log('form field_TYPE=FIELD field= ' + field + ' data=' + data);
        if (field == "objectType") {
            objectType = data;
        }
    });

    // log any errors that occur
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
        console.log('form end ');
        var responseJSON = {};
        if (fileCarrier.split('.').pop() != 'wav') {
            responseJSON["status"] = "error";
            responseJSON["error"] = "wrong data carrier extension";
            responseJSON["error-id"] = "1";
            res.json(responseJSON);
            res.end('success');
            return;
        }
        var resExt = objectType == "file" ? ".file" : ".txt";
        var resName = crypto.createHash('md5').update(Math.random().toString()).digest('hex') + resExt;
        console.log("Retrieve " + objectType + " " + fileCarrier + " " + path.join(resDir, resName));
        const ls = spawn('java', ['Java/src/steganography_tool/Steganography_Tool', 'Retrieve', objectType, fileCarrier, path.join(resDir, resName)]);

        ls.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            responseJSON["result"] = data;
        });

        ls.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });


        ls.on('close', (code) => {
            responseJSON["status"] = "success";
            responseJSON["error-id"] = 0;
            if (objectType == 'file') responseJSON["result"] = resName;
            res.json(responseJSON);
            res.end('success');
        });


    });

    // parse the incoming request containing the form data
    form.parse(req);

});

app.post('/upload/hide', function(req, res) {


    var curid = ++id;
    console.log("POST request id = " + curid.toString());
    var objectType;
    var object;
    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/uploads');

    var resDir = path.join(__dirname, '/results');
    var fileCarrier;
    var fileObject;
    var carrierExt;
    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        console.log('form field_TYPE=FILE field= ' + field + ' filename=' + file.name);
        var ext = '.' + file.name.split('.').pop();
        if (field == "fileObject") {
            fileObject = crypto.createHash('md5').update(Math.random().toString()).digest('hex');
            fs.rename(file.path, path.join(form.uploadDir, fileObject + ext));
            object = path.join(form.uploadDir, fileObject + ext);
        }
        else {
            carrierExt = ext;
            fileCarrier = crypto.createHash('md5').update(Math.random().toString()).digest('hex');
            fileCarrier = path.join(form.uploadDir, fileCarrier + ext);
            fs.rename(file.path, fileCarrier);

        }

    });

    form.on('field', function(field, data) {
        console.log('form field_TYPE=FIELD field= ' + field + ' data=' + data);
        if (field == "stringObject") {
            object = data;
        }
        else if (field == "objectType") {
            objectType = data;
        }
    });

    // log any errors that occur
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
        console.log('form end ');
        var responseJSON = {};
        if (fileCarrier.split('.').pop() != 'wav') {
            responseJSON["status"] = "error";
            responseJSON["error"] = "wrong data carrier extension";
            responseJSON["error-id"] = "1";
            res.json(responseJSON);
            res.end('success');
            return;
        }
        var resName = crypto.createHash('md5').update(Math.random().toString()).digest('hex') + carrierExt;
        const ls = spawn('java', ['Java/src/steganography_tool/Steganography_Tool', 'Hide', objectType, object, fileCarrier, path.join(resDir, resName)]);

        ls.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        ls.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });


        ls.on('close', (code) => {
            responseJSON["status"] = "success";
            responseJSON["error-id"] = 0;
            responseJSON["result"] = resName;
            res.json(responseJSON);
            res.end('success');
        });


    });

    // parse the incoming request containing the form data
    form.parse(req);

});

app.listen(process.env.PORT);