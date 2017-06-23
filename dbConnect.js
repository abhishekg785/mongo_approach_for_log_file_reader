var mongoose = require('mongoose');

module.exports = function(action) {
	var db;
    if(action == 'test') {
        db = 'testLogDB';
    }
    else {
        db = 'logDB';
    }
    var db = mongoose.connect('mongodb://localhost/' + db, function(err) {
        if(!err) {
            console.log('connected to db');
        }
        else {
            console.log('Error Occurred! Try Again');
        }
    });
}


