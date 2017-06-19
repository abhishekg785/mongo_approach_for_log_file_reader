var assert = require('chai').assert;
var expect = require('chai').expect;
var logHandler = require('../app/controllers/logHandler');

describe('handling LogHandler function', function() {
  describe('LogHandler constructor', function() {
    it('filepath and readStream should have values set to the ones passed', function() {
      var filePath = "/var/log/mongodb/mongod.log";
      var obj = new logHandler.LogHandler(filePath);
      expect(obj.filePath).to.equal(filePath);
    });
  })
})
