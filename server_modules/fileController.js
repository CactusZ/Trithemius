var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/*.wav',function(req,res){
    res.download(path.resolve(__dirname + '/../results/' + req.originalUrl.split('/').pop()));
});

module.exports = router;