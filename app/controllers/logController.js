/**
* author : abhishek goswami
* abhishekg785@gmail.com
*
* Future Improvements :
* Caching the file names which has been read so that they are not read again with the user requests
* Currently this has been done by maintaining the files in the DB which has been read and storing
* their data into DB for the first time, after than data is queried from DB
*/

var async = require('async'); // this will save me from callback hell
var logHandler = require('./logHandler');	// logHandler module for processing logs
var LogModel = require('../models/logModel'); // model for storing logs
var ReadFileModel = require('../models/readFileModel'); // model for having the files which has been read and dumped in mongo

;(function(exports) {

	'use strict'

	// variables to be accessed throughout
	var _Globals = {
		recordsCountPerPage : 10, // no of records per page
	}

	// defining user action object for navigation
	var ActionObj = {
		initial : 'initial', // inital page
		start : 'start-nav', // start page
		end : 'end-nav', // end page
		next : 'next-nav', // next 10 pages
		previous : 'previous-nav' // previous 10 pages
	}

	// Handles the GET request of the client for the index page
	exports.GetIndex = function(req, res) {
		res.render('index');
	}

	/**
	* Handles the POST request to the index page
	* Function does these things :
	* Fetch the filePath and required action
	* Check if the file has been read or not by looking for the file in the ReadFile module
	* if file is read then do not read it again
	* else if read the file and store the file contents in the DB and cache the file name in ReadFile model
	* Fetch the 10 records at a time and send the fetched data to the user
	*/
	exports.ProcessLogs = function(req, res) {

		// initial log params
		var logParameters = {
			filePath : '',
			currentPagePosition : 1,
			fileRecordsCount : 0,
			action : '',
		}

		var filePath = req.body.filePath,
				action = req.body.action,
				currentPagePosition = req.body.currentPagePosition;
		logParameters.filePath = filePath;
		logParameters.action = action;
		logParameters.currentPagePosition = currentPagePosition;

		async.waterfall(
			[
				function(callback) {
					callback(null, logParameters);
				},
				fileReadStatus,
				saveFileInDB,
				countFileRecords,
				processFilePositionParams,
				fetchLogs
			],
			function(err, updatedlogParams, data) {
				if(!err) {
					var fileRecordsCount = updatedlogParams.fileRecordsCount;
					var action = updatedlogParams.action;
					if(action == ActionObj.initial) {
						var resData = {
							'fileRecordsCount' : fileRecordsCount,
							'logs' : data
						}
						res.end(JSON.stringify(resData));
					}
					res.end(JSON.stringify(data));
				}
				else {
					var errorData = {
						'error' : String(err)
					}
					res.end(JSON.stringify(errorData));
				}
			});
		}

		/**
		*	Checks whether the file data has been read and stored in DB or not
		*
		* @param { object } logParameters - all the params of the log file required
		* @param { function } callback - callback function to return the status of the file read or not
		*/
		function fileReadStatus(logParameters, callback) {
			ReadFileModel.find({
				'fileName' : logParameters.filePath
			}).exec(function checkFileStatus(err, data) {
				if(!err) {
					// console.log('data' + data);
					if(data.length > 0) { // entry exists
						console.log('data exists');
						callback(null, logParameters, true);
					}
					else {
						callback(null, logParameters, false);
					}
				}
				else {
					console.log('Error occurred' + err);
				}
			});
		}

		/**
		* Stores the file into db if the file is not stored earlier using fileStatus
		*
		* @param { object } logParameters - all the params of the log file required
		* @param { string } fileStatus - status of the file ( read or not )
		* @param { function } callback - simple callback function to read the data and return the fetched data
		*/
		function saveFileInDB(logParameters, fileStatus, callback) {
			var filePath = logParameters.filePath;
			if(!fileStatus) {
				console.log('Saving file in DB');
				var logObj = new logHandler.LogHandler(filePath, callback);
				logObj.saveLogsInDB(function(err) {
					if(!err) {
						updateFileStatusInReadFileModel(filePath);
						callback(null, logParameters);
					}
					else {
						callback(err);
					}
				});
			}
			else {
				console.log('File has been read already');
				callback(null, logParameters); // file has been read already
			}
		}

		/**
		* Count the no of records or data in the db ( in the file )
		*
		* @param { object } logParameters - all the parameters for the log proceesing in a log file
		* @param { function } callback - simple callback function to read the data and return the fetched data
		*/
		function countFileRecords(logParameters, callback) {
			var filePath = logParameters.filePath;
			console.log('counting file records');
			LogModel.count({'filePath' : filePath}, function setFileRecordCount(err, count) { // calculates the total records in the file
				if(!err) {
					console.log('count' + count);
					logParameters.fileRecordsCount = count;
					callback(null, logParameters);
				}
				else {
					console.log('error occurred in counting the records');
					callback(err);
				}
			});
		}

		/**
		* Caclutes the starting and ending position of the file to read as per user's action
		*
		* @param { string } { object } logParameters - all the parameters for the log proceesing in a log file
		* @param { function } callback - simple callback function to read the data and return the fetched data
		*/
		function processFilePositionParams(logParameters, callback) {
			console.log('getting file reading start and end pos params');
			var filePath = logParameters.filePath,
					action = logParameters.action,
					currentPagePosition = logParameters.currentPagePosition,
					fileRecordsCount = logParameters.fileRecordsCount,
					temp = Math.floor(fileRecordsCount % _Globals.recordsCountPerPage),
					pageCount = Math.floor(fileRecordsCount / _Globals.recordsCountPerPage),
					totalPages = temp == 0 ? pageCount : pageCount + 1;

			var startPos, endPos;
			startPos = (currentPagePosition - 1) * _Globals.recordsCountPerPage + 1;
			if(currentPagePosition == totalPages && temp!=0) {
				endPos = startPos + temp;
			}
			else {
				endPos = startPos + _Globals.recordsCountPerPage - 1;
			}
			callback(null, logParameters, startPos, endPos);
		}

		/**
		* Fetches the logs from the DB using the awesome Promises
		*
		* @param { object } logParameters - all the parameters for the log proceesing in a log file
		* @param { string } startPos - start position to which the file read should be started
		* @param { string } endPos - end point or the last line to the read the file upto.
		* @param { function } callback - the function to send the data back to the user
		*/
		function fetchLogs(logParameters, startPos, endPos, callback) {
			console.log('Fetching files');
			var filePath = logParameters.filePath;
			LogModel.find({
				'filePath' : filePath
			})
			.sort({'lineNumber' : 1})
			.skip(startPos - 1)
			.limit(endPos - startPos + 1)
			.exec(function returnFetchedData(err, data) {
				if(!err) {
					callback(null, logParameters, data);
				}
				else {
					callback(err);
				}
			});
		}

		/**
		* Simply adds the file to the database to show that this file has been read
		*
		* @param { string }  filePath : path of the file which has been read
		*/
		function updateFileStatusInReadFileModel(filePath) {
			var newFile = new ReadFileModel({
				'fileName' : filePath
			});
			newFile.save(function(err, data) {
				if(!err) {
					console.log('file added to the read file model');
				}
				else {
					console.log(err);
				}
			});
		}

		// for testing purposes
		exports.fileReadStatus = fileReadStatus;
		exports.saveFileInDB = saveFileInDB;
	})(exports);
