'use strict';

var notifier = require('../lib/notifier'),
    expect = require('chai').expect;

describe('notifier', function () {

  describe('sns notifications', function () {
    var topicArn = 'arn:aws:sns:us-east-1:12345:TestTopicArn',
    sns = null,
    notify = null;

    beforeEach(function () {
      sns = {publish : function () {} };
      notify = notifier(sns, topicArn);
    });

    it('should set subject and message', function (done) {
      sns.publish = function (params) {
        expect(params.TopicArn).to.eql(topicArn);
        expect(params.Subject).to.eql('notify subject');
        expect(params.Message).to.eql('{"foo":"bar"}');
        return done();
      };

      notify('notify subject', {foo: 'bar'});
    });

    it('should not set subject', function (done) {
      sns.publish = function (params) {
        expect(params.TopicArn).to.eql(topicArn);
        expect(params.Subject).to.not.exist;
        expect(params.Message).to.eql('{"foo":"bar"}');
        return done();
      };

      notify({foo: 'bar'});
    });

    it('should set message as passed in string', function (done) {
      sns.publish = function (params) {
        expect(params.TopicArn).to.eql(topicArn);
        expect(params.Subject).to.not.exist;
        expect(params.Message).to.eql('this is a message');
        return done();
      };

      notify('this is a message');
    });

    it('should set message as stringified object', function (done) {
      sns.publish = function (params) {
        expect(params.Message).to.eql('{"foo":"bar"}');
        return done();
      };

      notify({foo: 'bar'});
    });

  });
});
