'use strict';

var _   = require('lodash');

var internals = {};

internals.identity = function () { };

internals.snsNotifier = function (sns, topicArn) {
  return function (subject, message, callback) {
    callback = callback || internals.identity;

    if(subject && !message) {
      message = subject;
      subject = null;
    }

    if(!_.isString(message)) {
      message = JSON.stringify(message);
    }

    var params = {TopicArn: topicArn, Message: message};

    if(subject) {
      params.Subject = subject;
    }

    sns.publish(params, callback);
  };
};

module.exports = function (sns, topicArn) {
  if(topicArn) {
    return internals.snsNotifier(sns, topicArn);
  } else {
    return internals.identity;
  }
};

