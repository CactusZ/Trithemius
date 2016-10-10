var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

router.get(['/*.wav', '/*.file'], function(req, res) {
    var filePath = path.resolve('./results/' + req.originalUrl.split('/').pop());
    
    /*Check file existance */
    fs.access(filePath, fs.R_OK, (err) => {
        if (!err) {
            res.download(filePath);
            return;
        }
        res.status(404);
        res.send("Not found!");
    });
});

module.exports = router;