var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var express = require('express');
var router = express.Router();
const spawn = require('child_process').spawn;

router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

router.post('/retrieve', function(req, res) {


    var objectType;

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload one file in a single request
    form.multiples = false;

    // store all uploads in the /uploads directory
    form.uploadDir = path.resolve('./uploads');

    var resDir = path.resolve('./results');
    var fileCarrier;

    // every time a file has been uploaded successfully,
    // rename it to it's random hashed name
    form.on('file', function(field, file) {
        console.log('form field_TYPE= FILE field= ' + field);
        var ext = '.' + file.name.split('.').pop();
        fileCarrier = crypto.createHash('md5').update(Math.random().toString()).digest('hex');
        fileCarrier = path.join(form.uploadDir, fileCarrier + ext);
        fs.rename(file.path, fileCarrier);
    });

    form.on('field', function(field, data) {
        console.log('form field_TYPE=FIELD field= ' + field);
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

        /* init as success. Will be changed if error appears*/
        responseJSON["status"] = "success";
        responseJSON["error-id"] = 0;
        responseJSON["result"] = "";

        var resExt = objectType == "file" ? ".file" : ".txt";
        var resName = crypto.createHash('md5').update(Math.random().toString()).digest('hex') + resExt;
        const ls = spawn('java', ['Java/src/steganography_tool/Steganography_Tool', 'Retrieve', objectType, fileCarrier, path.join(resDir, resName)]);

        console.log('java process started');
        ls.stdout.on('data', (data) => {
            responseJSON["result"] += `${data}`;
        });

        ls.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
            responseJSON["status"] = "error";
            responseJSON["error-id"] = 2;
            responseJSON["error"] = 'Processing error. Check files';
        });


        ls.on('close', (code) => {
            console.log('java process ended');
            /*remove uploaded files*/
            fs.unlink(fileCarrier, (err) => {
                if (err) {
                    console.log("error deleting file carrier!");
                }
            });

            if ((objectType == 'file') && (responseJSON["status"] == 'success')) {
                responseJSON["result"] = resName;
                /* Delete result file after 2 hours */
                setTimeout(() => {
                    fs.unlink(path.resolve('./results/' + resName));
                }, 7.2e6);
            }
            res.json(responseJSON);
            res.end('success');

        });


    });

    // parse the incoming request containing the form data
    form.parse(req);
});

router.post('/hide', function(req, res) {
    var objectType;
    var object;
    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.resolve('./uploads');

    var resDir = path.resolve('./results');
    var fileCarrier;
    var fileObject;
    var carrierExt;
    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        console.log('form field_TYPE= FILE field= ' + field);
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
        console.log('form field_TYPE=FIELD field= ' + field);
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

        /* init as success. change if error */
        responseJSON["status"] = "success";
        responseJSON["error-id"] = 0;

        var resName = crypto.createHash('md5').update(Math.random().toString()).digest('hex') + carrierExt;

        const ls = spawn('java', ['Java/src/steganography_tool/Steganography_Tool', 'Hide', objectType, object, fileCarrier, path.join(resDir, resName)]);

        ls.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        ls.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
            responseJSON["status"] = "error";
            responseJSON["error-id"] = 2;
            responseJSON["error"] = 'Processing error. Check files';
        });


        ls.on('close', (code) => {
            console.log('java process ended');

            /*remove uploaded files*/
            fs.unlink(fileCarrier, (err) => {
                if (err) {
                    console.log("error deleting file carrier!");
                }
            });
            if (objectType == 'file') {
                fs.unlink(object, (err) => {
                    if (err) {
                        console.log("error deleting object file!");
                    }
                });
            }


            if (responseJSON["status"] == 'success') {
                responseJSON["result"] = resName;
                setTimeout(() => {
                    fs.unlink(path.resolve('./results/' + resName));
                }, 7.2e6);

            }
            res.json(responseJSON);
            res.end('success');
        });


    });

    // parse the incoming request containing the form data
    form.parse(req);

});
module.exports = router;
