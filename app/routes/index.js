var express = require('express');
var router = express.Router();

var indexController = require('../controllers/indexController');


router.get('/', indexController.GetIndex);
router.post('/', indexController.ProcessLogs);

module.exports = router;
