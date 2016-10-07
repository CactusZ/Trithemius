var express = require('express');
var router = express.Router();
var path = require('path');

router.get(['/*.wav','/*.file'],function(req,res){
    res.download(path.resolve('./results/' + req.originalUrl.split('/').pop()));
});

module.exports = router;