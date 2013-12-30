'use strict';

var Schema = require('../lib/schema'),
    expect = require('chai').expect;

describe('Schema', function () {

  describe('#queue', function () {
    it('fails when passing no args', function (done) {
      expect(Schema.queue()).to.exist;
      done();
    });

    it('fails when passing null', function (done) {
      var settings = null;

      expect(Schema.queue(settings)).to.exist;
      done();
    });

    it('fails when passing empty settings object', function (done) {
      var settings = { };

      expect(Schema.queue(settings)).to.exist;
      done();
    });

    it('fails when unknown properties exist', function (done) {

      var settings = { unknown: true, something: {} };

      expect(Schema.queue(settings)).to.exist;
      done();
    });

    it('succeeds with only passing queueURL', function (done) {
      var settings = { queueURL: 'https://sqs.us-east-1.amazonaws.com/123/example-job-queue' };

      expect(Schema.queue(settings)).to.not.exist;
      done();
    });

    it('succeeds with optional completed notification setting', function (done) {
      var settings = {
        queueURL: 'https://sqs.us-east-1.amazonaws.com/123/example-job-queue',
        notifications : {
          completed : 'arn:aws:sns:us-east-1:123:TestTopic'
        }
      };

      expect(Schema.queue(settings)).to.not.exist;
      done();
    });

    it('succeeds with optional error notification setting', function (done) {
      var settings = {
        queueURL: 'https://sqs.us-east-1.amazonaws.com/123/example-job-queue',
        notifications : {
          error : 'arn:aws:sns:us-east-1:123:ErrorTopic'
        }
      };

      expect(Schema.queue(settings)).to.not.exist;
      done();
    });

    it('succeeds with optional progressing notification setting', function (done) {
      var settings = {
        queueURL: 'https://sqs.us-east-1.amazonaws.com/123/example-job-queue',
        notifications : {
          progressing : 'arn:aws:sns:us-east-1:123:ProgTopic'
        }
      };

      expect(Schema.queue(settings)).to.not.exist;
      done();
    });

    it('succeeds when setting all notifications', function (done) {
      var settings = {
        queueURL: 'https://sqs.us-east-1.amazonaws.com/123/example-job-queue',
        notifications : {
          progressing : 'arn:aws:sns:us-east-1:123:ProgTopic',
          completed : 'arn:aws:sns:us-east-1:123:TestTopic',
          error : 'arn:aws:sns:us-east-1:123:ErrorTopic'
        }
      };

      expect(Schema.queue(settings)).to.not.exist;
      done();
    });

    it('succeeds with valid concurrency setting', function () {
      var settings = {
        queueURL: 'https://sqs.us-east-1.amazonaws.com/123/example-job-queue',
        concurrency: 5
      };

      expect(Schema.queue(settings)).to.not.exist;
    });

    it('succeeds with setting access Keys', function () {
      var settings = {
        queueURL: 'https://sqs.us-east-1.amazonaws.com/123/example-job-queue',
        accessKeyId: 'AK12346',
        secretAccessKey: 'secret'
      };

      expect(Schema.queue(settings)).to.not.exist;
    });

    it('fails when only setting accessKeyId', function (done) {

      var settings = {
        queueURL: 'https://sqs.us-east-1.amazonaws.com/123/example-job-queue',
        accessKeyId: 'AK12346'
      };

      expect(Schema.queue(settings)).to.exist;
      done();
    });

    it('fails when only setting secretAccessKey', function (done) {

      var settings = {
        queueURL: 'https://sqs.us-east-1.amazonaws.com/123/example-job-queue',
        secretAccessKey: 'secret'
      };

      expect(Schema.queue(settings)).to.exist;
      done();
    });

    it('succeeds with setting region', function () {
      var settings = {
        queueURL: 'https://sqs.us-east-1.amazonaws.com/123/example-job-queue',
        region: 'us-east-1'
      };

      expect(Schema.queue(settings)).to.not.exist;
    });

  });

});
