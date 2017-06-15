/*
* author : abhishek goswami
* abhishekg785@gmail.com
*
* Read the log file into and stores them into the Database
*/

var fs = require('fs');
var es = require('event-stream');

var LogModel = require('../models/logModel');

/*
* Steps :
* Do not read the file as a whole into the memory as RAM and memory consumption will be high,
* instead use stream to read files as a buffer or chunks
* 1. Read the file line by line using streams
* 2. Store each line in mongoDB
*/

var exports = module.exports;

;(function(exports) {

	'use strict'

	var lineNumber = 0; // line no. in the file

	/**
	* Handles the Logs to store the logs into MongoDB
	*
	* @constructor
	* @param { string } filePath - The path to the file
	*/
	function LogHandler(filePath) {
		this.filePath = filePath;
		this.readStream = fs.createReadStream(filePath); // create a read stream to read files in chunks
	}

	/**
	* Saves fetched logs from the file into the MongoDB line by line at a time
	*
	* @param { function } callback - callback function to save file line into DB
	* @param { function } sendData - callback function to process the fetched data and send to client
	*/
	LogHandler.prototype.saveLogsInDB = function(callback) {
		var that = this;
		that.readStream.pipe(es.split())
		.pipe(es.mapSync(function(line) {
			that.readStream.pause();
			lineNumber += 1;
			that.saveLog(line, lineNumber);
		}))
		.on('end', function() {
			console.log('File processed till end');
			callback();
		})
		.on('error', function(err) {
			callback(err);
		})
	}

	/**
	* save logs to the DB line by line
	*
	* @param { string } log - log data from the file
	* @param { number } lineNumber - current line count on the file
	*/
	LogHandler.prototype.saveLog = function(log, lineNumber) {
		var that = this;
		if(log.length > 0) {
			var newLog = new LogModel({ // creates a new record to save
				lineNumber : lineNumber,
				log: log,
				filePath : that.filePath
			});
			newLog.save(function saveDataToDB(err, data) {
				if(!err) {
					console.log('data saved into DB');
				}
				else {
					console.log('error occurred in saving data to db');
				}
				that.readStream.resume(); // resume read stream after these operations
			});
		}
		else {
			that.readStream.resume();
		}
	}

	exports.LogHandler = LogHandler;

})(exports);
