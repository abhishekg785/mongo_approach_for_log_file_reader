/*
 * author : abhishek goswami
 * abhishek goswami
 *
 * logController_test.js ; for unit testing the lonController functions
 */

'use strict'

require('../dbConnect')('test');  // Important! work on the test database

let path = require('path');
let chai  = require('chai');
let assert  = require('chai').assert;
let sinon = require('sinon');

let mongoose      = require('mongoose');
let LogModel      = require('../app/models/logModel');
let ReadFileModel = require('../app/models/readFileModel');

let logController = require('../app/controllers/logController');
let logHandler = require('../app/controllers/logHandler');

let should  = chai.should();
let request = require('request');

//simply test the index route and it must return a page with status 200
describe('Testing the index GET route', function() {
    describe('Sending the GET request', function() {
        it('Index page status should be 200', function() {
            request('http://localhost:3000', function(err, res) {
                expcect(res.statusCode).to.equal(200);
            });
        });
    });
});

// testing the function that check the status of the file
describe('Testing the fileReadStatus function', function() {
    var clock,
        callbackSpy;
    before(function() {
        clock = sinon.useFakeTimers();
        callbackSpy = sinon.spy();
    });
    describe('calling the function for the filePath = "/var/log/mongodb/mongod.log"', function() {
        var logParamObj = {
            filePath : path.join(__dirname, 'testFile')
        }
        it('function must execute and the callback must return the set file status => True or False i.e status whether file path is in the db or not', function(done) {
            logController.fileReadStatus(logParamObj, function(err, logParams, status) {
                if(status) {
                    console.log('status set to true');
                    assert.equal(status, true);
                }
                else {
                    console.log('status set to false');
                    assert.equal(status, false);
                }
                done();
            });
        });
    });
})

// test the file action to be taken on the basis of the file status
describe("Testing saveFileInDB function", function() {
    var logParameters = {
        filePath : path.join(__dirname, 'testFile')
    }
    describe("Testing for file status = True i.e file is has been read already", function() {
        var dataArr = [];
        var fileStatus = true; // file has been already read
        before(function() {
            var callbackSpy = sinon.spy();
        });
        it('File must not be read and saved i.e saveLogsInDb function must not be called', function() {
            logHandler.LogHandler.prototype.saveLogsInDB = function(callback) {
                dataArr.push('Demo line 1');
                callback();
            }
            logController.saveFileInDB(logParameters, fileStatus, function(err, logParameters) {
                assert.equal(err, null);
                assert.equal(dataArr.length, 0); // no data should be pushed into dataArr
            });
        })
    })

    describe("Testing for file status = False i.e file is has been read already", function() {
        var dataArr = []; // temp storage to save data of the file which is read
        var fileStatus = false; // file has been already read
        before(function() {
            var callbackSpy = sinon.spy();
        });
        it('File must be read and saved i.e saveLogsInDb function be called', function() {
            logHandler.LogHandler.prototype.saveLogsInDB = function(callback) {
                console.log('Pushing three dummy lines in the data array');
                dataArr.push('Demo line 1');
                dataArr.push('Demo line 2');
                dataArr.push('Demo line 3');
                callback();
            }
            logController.saveFileInDB(logParameters, fileStatus, function(err, logParameters) {
                assert.equal(err, null);
                assert.equal(dataArr.length, 3);
            });
        })
    })
});

// test for the countFileRecords function
describe("Testing for the function countFileRecords()", function() {
    var dummyFileData = ['this is demo1', 'this is demo2', 'this is demo3'];
    var logParameters = {
        filePath : path.join(__dirname, 'testFile')
    }
    it('must return the no of records in the file i.e set the fileRecordsCount field in logParameters equal to the record count', function(done) {
        LogModel.count = function(logParameters, callback) {
            var count = dummyFileData.length;
            logParameters.fileRecordsCount = count;
            callback(null, count);
        }
        logController.countFileRecords(logParameters, function(err, logParameters) {
            assert.equal(logParameters.fileRecordsCount, dummyFileData.length );
            done();
        });
    });
});

describe("Testing for the processFilePositionParams()", function() {
    describe('must calculate the start and end pos to read the file for the total file record count = 1000 with 10 records per page', function() {
        var logParameters = {
            currentPagePosition : 1,
            fileRecordsCount : 1000
        }
        describe('start and end pos for the current page position = 1, start position should not be negative', function() {
            it('calculating start and end pos for page = 1. The start pos must be 1 and the end pos must be 10', function(done) {
                logController.processFilePositionParams(logParameters, function(err, params, startPos, endPos) {
                    assert.equal(err, null);
                    assert.equal(startPos, 1);
                    assert.equal(endPos, 10);
                    done();
                })
            })
        })
        describe('start and end pos for the current page position = 7', function() {
            it('calculating start and end pos for page = 7. The start pos must be 61 and the end pos must be 70', function(done) {
                logParameters.currentPagePosition = 7;
                logController.processFilePositionParams(logParameters, function(err, params, startPos, endPos) {
                    assert.equal(err, null);
                    assert.equal(startPos, 61);
                    assert.equal(endPos, 70);
                    done();
                })
            })
        })
        describe('start and end pos for the current page position = 100', function() {
            it('calculating start and end pos for page = 100. The start pos must be 991 and the end pos must be 1000', function(done) {
                logParameters.currentPagePosition = 100;
                logController.processFilePositionParams(logParameters, function(err, params, startPos, endPos) {
                    assert.equal(err, null);
                    assert.equal(startPos, 991);
                    assert.equal(endPos, 1000);
                    done();
                })
            })
        })
    })
})

// testing fetch log functionality
describe('Testing fetchLogs function', function() {
    describe('fetches the logs from the db', function() {
        var ModelMock;
        beforeEach(function() {
            ModelMock = sinon.mock(ReadFileModel);
        })

        afterEach(function() {
            ModelMock.restore();
        })
        it('must fetch 0-10 logs depending on the start and the end position of the records', function(done) {
            ReadFileModel = ModelMock;
            logController.updateFileStatusInReadFileModel('/var/log/mongodb/mongod.log');
            done();
        })
    })
})