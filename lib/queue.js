'use strict';

var _ = require('lodash');

var internals = {};

internals.sender = function(sqs, data, callback) {
  sqs.sendMessage({
    MessageBody : JSON.stringify(data)
  }, function (err) {
    if(err) {
      return callback(err);
    } else {
      return callback();
    }
  });
};

internals.reader = function (sqs, maxMessages, callback) {
  if(maxMessages > 10) {
    maxMessages = 10;
  }

  sqs.receiveMessage({
    AttributeNames : ['ApproximateReceiveCount'],
    MaxNumberOfMessages : maxMessages,
    WaitTimeSeconds: 20
  }, function (err, data) {
    if(err) {
      return callback(err);
    } else if (!data.Messages) {
      return callback(null, []);
    } else {
      var messages = _.map(data.Messages, function (msg) {
        var job = {
          id : msg.MessageId,
          data : JSON.parse(msg.Body),
          destroy : internals.deleteMessage(sqs, msg.ReceiptHandle)
        };

        return job;
      });

      return callback(null, messages);
    }
  });
};

internals.deleteMessage = function (sqs, handle) {
  return function (callback) {
    callback = callback || function () {};

    sqs.deleteMessage({
      ReceiptHandle : handle
    }, callback);
  };
};

internals.getQueueAttributes = function(sqs, params, callback) {
  sqs.getQueueAttributes(params, callback);
};

module.exports = function (sqs) {
  return {
    send: _.partial(internals.sender, sqs),
    read: _.partial(internals.reader, sqs, 10),
    getAttributes: _.partial(internals.getQueueAttributes, sqs)
  };
};
