'use strict'

let path = require('path');

require('../dbConnect')('test'); // require connection to testDB
let sinon = require('sinon');
let assert = require('chai').assert;
let expect = require('chai').expect;

let logHandler = require('../app/controllers/logHandler');

var LogModel = require('../app/models/logModel');

describe("Testing logHandler module", function() {

    var obj,
        filePath = String(path.join(__dirname, '/testFile')); // the test file to use

    beforeEach(function() {
        obj = new logHandler.LogHandler(filePath);
    });

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

    after(function() {
        LogModel.remove({}, function() {
            console.log('removed');
        });
    });
});
