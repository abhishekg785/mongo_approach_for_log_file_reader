/*
* author : abhishek goswami
* abhishekg785@gmail.com
*
* Read the log file into and stores them into the Database
*/

var fs = require('fs');
var es = require('event-stream');

var LogModel = require('../models/logModel');
// var dbConnect = require('./dbConnect');

/*
* Steps :
* 1. Read the file line by line using streams
* 2. Store each line in mongoDB
*/
var exports = module.exports;

;(function(exports) {
	'use strict'

	var lineNumber = 0;

	function LogHandler(filePath) {
		this.filePath = filePath;
		this.readStream = fs.createReadStream(filePath);
	}

	LogHandler.prototype.saveLogsInDB = function(callback, sendData) {
		var that = this;
		that.readStream.pipe(es.split())
		.pipe(es.mapSync(function(line) {

			that.readStream.pause();
			lineNumber += 1;
			callback.call(that, line, lineNumber);

		}))
		.on('end', function() {
			console.log('File Processed successfully');
			sendData();
		})
		.on('error', function(err) {
			console.log('Error reading file!');
		})
	}

	// save log to db here using callback
	LogHandler.prototype.saveLog = function(log, lineNumber) {
		var that = this;
		var newLog = new LogModel({
			lineNumber : lineNumber,
			log: log
		});
		newLog.save(function(err, data) {
			if(!err) {
				console.log('data saved');
			}
			else {
				console.log('error occurred in saving data to db');
			}
			that.readStream.resume();
		});
	}

	// var filePath = '/var/log/mongodb/mongod.log';
	// var obj = new LogHandler(filePath);
	// obj.saveLogsInDB(obj.saveLog);

	exports.LogHandler = LogHandler;

})(exports);
