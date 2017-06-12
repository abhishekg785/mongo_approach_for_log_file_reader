var mongoose = require('mongoose');

mongoose.Promise = global.Promise; // set the mongoose promise to default

var logSchema = mongoose.Schema({
	lineNumber : Number,
	log : String
});

var LogModel = mongoose.model('LogModel', logSchema);

module.exports = LogModel;
