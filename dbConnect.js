/**
 * @author : abhishek goswami
 *
 * db_connect.js : connects the app to the MongoDB
 * Decides which Database to connect to on the basis of test files or production code
 */
var mongoose = require('mongoose');

module.exports = function(action) {

    var db;

    /*
     * if the user is testing the application
     * connect the user to the test DB i.e testLogDB
     */
    if(action == 'test') {
        db = 'testLogDB';
    }
    else {
        db = 'logDB';
    }

    // creates connection to the required db
    var db = mongoose.connect('mongodb://localhost/' + db, function(err) {
        if(!err) {
            console.log('connected to db');
        }
        else {
            console.log('Error Occurred! Try Again');
        }
    });
}


