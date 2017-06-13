var logHandler = require('./logHandler');
var LogModel = require('../models/logModel');

;(function(exports) {

	'use strict'

	var _Globals = {
	  readFileRecords : [],
		currentPagePosition : 1, // initally current position is set to page 1
		fileRecordsCount : 0,
		recordsCountPerPage : 10
	}

	var ActionObj = {
		initial : 'initial',
		start : 'start-nav',
		end : 'end-nav',
		next : 'next-nav',
		previous : 'previous-nav'
	}

	exports.GetIndex = function(req, res) {
		setGlobalValToZero();
		res.render('index');
	}

	exports.ProcessLogs = function(req, res) {
		var filePath = req.body.filePath,
				action = req.body.action;
		var fileStatus = fileReadStatus(filePath);
		if(!fileStatus) {
			var logObj = new logHandler.LogHandler(filePath);
			logObj.saveLogsInDB(logObj.saveLog, function() {
				_Globals.readFileRecords.push(filePath);
				fetchLogs(filePath, action, function(logData) {
					console.log('here i am');
					console.log('page' + _Globals.currentPagePosition);
					LogModel.count({}, function(err, count) {
						if(!err) {
							_Globals.fileRecordsCount = count;
						}
						else {
							console.log('error counting records');
						}
					});
					var resData = JSON.stringify(logData);
					res.end(resData)
				});;
			});
		}
		else {
			console.log('File has been read already');
			fetchLogs(filePath, action, function(logData) {
				console.log('page' + _Globals.currentPagePosition);
				var resData = JSON.stringify(logData);
				console.log(resData);
				res.end(resData);
			});
		}
	}

	function fileReadStatus(filePath) {
		if(_Globals.readFileRecords.indexOf(filePath) != -1) {
			return true;
		}
		return false;
	}

	function fetchLogs(filePath, action, callback) {
		/*
		*	simple get the current page
		* get the start and the last pos
		* take cases like start page < 0
		* and case for endPos > noOfRecords
		*/
		var totalPages;
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
		}
		else if(action == ActionObj.previous) {
			if(_Globals.currentPagePosition - 1 >= 1) {
				_Globals.currentPagePosition -= 1;
			}
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
		// console.log('start' + startPos);
		// console.log('end' + endPos);

		LogModel.find({}).sort({'lineNumber' : 1}).skip(startPos - 1).limit(endPos - startPos + 1).exec(function(err, data) {
			// console.log(data);
			callback(data);
		});
	}

	function setGlobalValToZero() {
		_Globals.readFileRecords = [];
		_Globals.currentPagePosition = 0;
		_Globals.fileRecordsCount = 0;
		_Globals.recordsCountPerPage = 10;
	}

})(exports);
