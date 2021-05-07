var express = require('express');  
var router = express.Router();

var elastic = require('../services/elasticSearchServices');

/* GET suggestions */
router.get('/suggest/:input', function (req, res, next) {  
  // if(req.query.userType == "admin"){
    elastic.getSuggestions(req.params.input, req.query.domain, req.query.userType).then(function (result) { res.json(result) });
  // }
  // else
  // elastic.getSuggestions(req.params.input, req.query.domain, req.query.userType).then(function (result) { res.json(result) });
});

/* POST document to be indexed */
router.post('/add_suggest', function (req, res, next) {  
  elastic.addDocument(req.body).then(function (result) { res.json(result) });
});

module.exports = router;