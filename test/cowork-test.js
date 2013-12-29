'use strict';

var cowork       = require('../lib/cowork.js'),
    EventEmitter = require('events').EventEmitter,
    expect       = require('chai').expect;

describe('cowork', function () {

  var worker = function (job, callback) {
    console.log('processing job', job.id);
    return callback();
  };

  var settings = {
    queueURL: 'https://sqs.us-east-1.amazonaws.com/123/example-job-queue'
  };

  describe('#createQueue', function () {

    it('should return configured queue when passing a worker and settings', function () {
      var queue = cowork.createQueue(worker, settings);
      expect(queue).to.be.an.instanceof(EventEmitter);
    });

    it('should return configured queue when passing only settings', function () {
      var queue = cowork.createQueue(settings);
      expect(queue).to.be.an.instanceof(EventEmitter);
    });

    it('should throw error when passing more than 2 arguments', function () {
      var create = function () {
        cowork.createQueue(worker, settings, 'somearg');
      };

      expect(create).to.throw(/Too many arguments/);
    });

    it('should throw error when passing only worker', function () {
      var create = function () {
        cowork.createQueue(worker);
      };

      expect(create).to.throw(/Bad arguments: Settings is required/);
    });
  });

});
