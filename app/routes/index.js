/**
* author : abhishek goswami
* abhishekg785@gmail.
*/

var express = require('express');
var router = express.Router();

var logController = require('../controllers/logController');


router.get('/', logController.GetIndex); // handles GET request route for /
router.post('/', logController.ProcessLogs); // hanldles POST request for /

module.exports = router;
