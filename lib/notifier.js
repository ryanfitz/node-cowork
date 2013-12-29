'use strict';

var AWS = require('aws-sdk'),
    _   = require('lodash');

var internals = {};

internals.identity = function () { };

internals.sns = function (topicArn) {
  return new AWS.SNS({
    params: {TopicArn: topicArn}
  });
};

internals.snsNotifier = function (sns) {
  return function (subject, message, callback) {
    callback = callback || internals.identity;

    if(subject && !message) {
      message = subject;
      subject = null;
    }

    if(!_.isString(message)) {
      message = JSON.stringify(message);
    }

    var params = {Message: message};

    if(subject) {
      params.Subject = subject;
    }

    sns.publish(params, callback);
  };
};

module.exports = function (topicArn) {
  if(topicArn) {
    return internals.snsNotifier(internals.sns(topicArn));
  } else {
    return internals.identity;
  }
};

