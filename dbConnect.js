var mongoose = require('mongoose');

var db = mongoose.connect('mongodb://localhost/logDB', function(err) {
	if(!err) {
		console.log('connected to db');
	}
	else {
		console.log('Error Occurred! Try Again');
	}
});

