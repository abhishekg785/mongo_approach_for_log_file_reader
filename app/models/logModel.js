/**
* author : abhishek goswami
* abhishekg785@gmail.com
*
* Model for storing Logs in the MongoDB
*/
var mongoose = require('mongoose');

mongoose.Promise = global.Promise; // set the mongoose promise to default

var logSchema = mongoose.Schema({
	lineNumber : Number, 			// no of the log
	log : String,							// log
	filePath : String					// path of the file the log belong to
});

var LogModel = mongoose.model('LogModel', logSchema);

module.exports = LogModel;
