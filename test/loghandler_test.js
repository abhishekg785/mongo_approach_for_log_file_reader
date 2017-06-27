/**
 * author : abhishek goswami
 * abhishekg785@gmail.com
 *
 * logHandler_test.js : unit test for the logHandler.js module
 */

'use strict'

let path = require('path');

require('../dbConnect')('test'); // work on the test database
let sinon = require('sinon');
let assert = require('chai').assert;
let expect = require('chai').expect;

let logHandler = require('../app/controllers/logHandler');

var LogModel = require('../app/models/logModel');
var ReadFileModel = require('../app/models/readFileModel');

/*
* Testing starts here
* Simply attach the beforeEach and after function to attach the object of LogHanlder
 */
describe("Testing logHandler module", function() {

    var obj,
        filePath = String(path.join(__dirname, '/testFile')); // the test file to use

    beforeEach(function() {
        obj = new logHandler.LogHandler(filePath);
    });

    /*
    * LogHanlder constructor must set the values to the passed values
     */
    describe('handling LogHandler function', function() {
        describe('LogHandler constructor', function() {
            it('filepath and readStream should have values set to the ones passed', function(done) {
                expect(obj.filePath).to.equal(filePath);
                done();
            });
        })
    })

    describe('saveLogsInDB function', function() {
        describe('saving logs in db', function() {
            it('file logs should be saved into the DB', function(done) {
                obj.saveLogsInDB(function(err, data) {
                    assert.equal(err, null);
                    done();
                });
            });
        });
    });

    describe('testing saveLog()', function() {
        it('must save the log and the lineNumber into the DB passed as a parameter', function(done){
            var demoLog = 'This is demo log',
                lineNumber = 100;
            obj.saveLog(demoLog, lineNumber);
            process.nextTick(function() {
                LogModel.findOne(
                    {
                        'log' : demoLog,
                        'lineNumber' : lineNumber
                    }
                ).exec(function(err, data) {
                    console.log(data);
                    assert(data.lineNumber, lineNumber);
                    assert(data.log, demoLog);
                    done();
                });
            });
        });
    });

    // empty the unit database after testing
    after(function() {
        LogModel.remove({}, function() {
            console.log('Removed from LogModel');
        });
        ReadFileModel.remove({}, function() {
            console.log('removed from ReadFileModel');
        })
    });
});
