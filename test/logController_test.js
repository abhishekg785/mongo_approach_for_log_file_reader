'use strict'

let chai = require('chai');
let chaiHttp = require('chai-http');

let assert = require('chai').assert;
let expcect = require('chai').expect;

let mongoose = require('mongoose');
let LogModel = require('../app/models/logModel');
let ReadFileModel = require('../app/models/readFileModel');

let server = require('../bin/www');
let should = chai.should();

let request = require('request');

// simply test the index route and it must return a page with status 200
describe('Testing the index GET route', function() {
  describe('Sending the GET request', function() {
    it('Index page status should be 200', function() {
      request('http://localhost:3000', function(err, res) {
        expcect(res.statusCode).to.equal(200);
      });
    });
  });
});
