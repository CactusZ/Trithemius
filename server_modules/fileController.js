var express = require('express');
var router = express.Router();

router.get('/*.wav',function(req,res){
    res.sendfile('index.html', {
        root: './client'
    });
});

module.exports = router;