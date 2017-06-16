/**
* author : abhishek goswami
* abhishekg785@gmail.com
*
* Future Improvements : Currently i am using simple callbacks to hanldle stuff
* Using Async.js will be a better choice
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
		// readFileRecords : [], // for caching the names of file which has been read
		currentPagePosition : 1, // initally current position is set to page 1
		fileRecordsCount : 0,	// count of the no of records in the file ( value is set later )
		recordsCountPerPage : 10, // no of records per page
		action : '',
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
		setGlobalValToZero();
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
		var filePath = req.body.filePath,
		action = req.body.action;
		_Globals.action = action;
		/*
		* In series as both if file is not present then no count so,
		* First read the file status
		* Then count the no of records in the file
		*/
		async.waterfall(
			[
				function(callback) {
					callback(null, filePath);
				},
				fileReadStatus,
				saveFileInDB,
				countFileRecords,
				processFilePositionParams,
				fetchLogs
			],
			function(err, result) {
				if(!err) {
					// console.log(result);
					res.end(JSON.stringify(result));
				}
				else {
					console.log(err);
				}
			});
		}

		/**
		*	Checks whether the file data has been read and stored in DB or not
		*
		* @param { string } filePath - path of the file
		* @param { function } callback - callback function to return the status of the file read or not
		*/
		function fileReadStatus(filePath, callback) {
			console.log('Reading file status');
			ReadFileModel.find({
				'fileName' : filePath
			}).exec(function checkFileStatus(err, data) {
				if(!err) {
					// console.log('data' + data);
					if(data.length > 0) { // entry exists
						console.log('data exists');
						callback(null, filePath, true);
					}
					else {
						var newFile = new ReadFileModel({
							'fileName' : filePath
						});
						newFile.save(function(err, data) {
							if(!err) {
								console.log('data saved');
							}
							else {
								console.log(err);
							}
						});
						callback(null, filePath, false);
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
		* @param { string } filePath - Path of the file
		* @param { string }
		* @param { callback }
		*/
		function saveFileInDB(filePath, fileStatus, callback) {
			if(!fileStatus) {
				console.log('Saving file in DB');
				var logObj = new logHandler.LogHandler(filePath);
				logObj.saveLogsInDB(function(err) {
					if(!err) {
						callback(null, filePath, fileStatus);
					}
					else {
						callback(null, err);
					}
				});
			}
			else {
				console.log('File has been read already');
				callback(null, filePath, fileStatus); // file has been read already
			}
		}

		function countFileRecords(filePath, fileStatus, callback) {
			console.log('counting file records');
			LogModel.count({'filePath' : filePath}, function setFileRecordCount(err, count) { // calculates the total records in the file
				if(!err) {
					_Globals.fileRecordsCount = count;
					callback(null, filePath, _Globals.action);
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
		* @param { string } filePath - path to the file
		* @param { string } action - user's action to be taken
		* @param { function } callback - simple callback function to read the data and return the fetched data
		*/
		function processFilePositionParams(filePath, action, callback) {
			console.log('getting file reading start and end pos params');
			var totalPages = 0;
			var totalRecords = _Globals.fileRecordsCount;
			var temp = Math.floor(totalRecords % _Globals.recordsCountPerPage);
			var pageCount = Math.floor(totalRecords / _Globals.recordsCountPerPage);
			if(temp == 0) {  // exact no of pages
				totalPages = pageCount;
			}
			else { // some data is left and one additional page required
				totalPages = pageCount + 1;
			}
			if(action == ActionObj.initial || action == ActionObj.start) {
				_Globals.currentPagePosition = 1;
			}
			else if(action == ActionObj.next) {
				if(_Globals.currentPagePosition + 1 <= totalPages) {
					_Globals.currentPagePosition += 1;
				}
				console.log(_Globals.currentPagePosition);
				console.log(action);
			}
			else if(action == ActionObj.previous) {
				if(_Globals.currentPagePosition - 1 >= 1) {
					_Globals.currentPagePosition -= 1;
				}
				console.log(_Globals.currentPagePosition);
				console.log(action);
			}
			else if(action == ActionObj.end) {
				_Globals.currentPagePosition = totalPages;
			}
			var startPos = (_Globals.currentPagePosition - 1) * _Globals.recordsCountPerPage + 1;
			if(_Globals.currentPagePosition == totalPages && temp!=0) {
				var endPos = startPos + temp;
			}
			else {
				var endPos = startPos + _Globals.recordsCountPerPage - 1;
			}
			callback(null, filePath, startPos, endPos);
		}

		/**
		* Fetches the logs from the DB using the awesome Promises
		*
		* @param { string } filePath - path to the file
		* @param { string } startPos - start position to which the file read should be started
		* @param { string } endPos - end point or the last line to the read the file upto.
		* @param { function } callback - the function to send the data back to the user
		*/
		function fetchLogs(filePath, startPos, endPos, callback) {
			console.log('Fetching files');
			LogModel.find({
				'filePath' : filePath
			})
			.sort({'lineNumber' : 1})
			.skip(startPos - 1)
			.limit(endPos - startPos + 1)
			.exec(function returnFetchedData(err, data) {
				if(!err) {
					callback(null, data);
				}
				else {
					callback(null, err);
				}
			});
		}

		/**
		*	Sets all _Global variables to zero
		*/
		function setGlobalValToZero() {
			_Globals.readFileRecords = [];
			_Globals.currentPagePosition = 0;
			_Globals.fileRecordsCount = 0;
			_Globals.recordsCountPerPage = 10;
		}

	})(exports);
