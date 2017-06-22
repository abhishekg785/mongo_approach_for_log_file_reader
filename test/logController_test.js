/*
 * author : abhishek goswami
 * abhishek goswami
 *
 * logController_test.js ; for unit testing the lonController functions
 */
'use strict'

require('../dbConnect');
let chai  = require('chai');
let sinon = require('sinon');

let assert  = require('chai').assert;
let expect = require('chai').expect;

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
            filePath : '/var/log/mongodb/mongod.log'
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
        filePath : '/var/log/mongodb/mongod.log'
    }
    describe("Testing for file status = True i.e file is has been read already", function() {
      var dataArr = [];
        var fileStatus = true; // file has been already read
        before(function() {
          var callbackSpy = sinon.spy();
        });
        it('File must not be read and saved i.e saveLogsInDb function must not be called', function() {
            logHandler.LogHandler.prototype.saveLogsInDB = function(callback) {
                console.log('----------------------------------');
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
                console.log('----------------------------------');
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
})

