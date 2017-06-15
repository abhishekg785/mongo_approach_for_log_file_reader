/**
* author : abhishek goswami
* abhishekg785@gmail.
*/

var express = require('express');
var router = express.Router();

var indexController = require('../controllers/logPromises');


router.get('/', indexController.GetIndex); // handles GET request route for /
router.post('/', indexController.ProcessLogs); // hanldles POST request for /

module.exports = router;
