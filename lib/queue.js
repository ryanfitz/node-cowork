'use strict';

var _     = require('lodash'),
    async = require('async');

var internals = {};

internals.buckets = function (keys) {
  var buckets = [];

  while( keys.length ) {
    buckets.push( keys.splice(0, 10) );
  }

  return buckets;
};

internals.sendBatch = function (sqs, data, callback) {
  var messageBuckets = internals.buckets(data);

  var id = 1;
  var send = function (messages, callback) {
    var entries = _.map(messages, function (data) {
      return { MessageBody : JSON.stringify(data), Id: 'msg-' + id++ };
    });

    sqs.sendMessageBatch({
      Entries : entries
    }, callback);
  };

  return async.each(messageBuckets, send, callback);
};

internals.sender = function(sqs, data, callback) {
  if(_.isArray(data)) {
    return internals.sendBatch(sqs, data, callback);
  }

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

internals.buildJob = function (msg) {
  return {
    id : msg.MessageId,
    handle : msg.ReceiptHandle,
    data : JSON.parse(msg.Body)
  };
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
      var messages = _.map(data.Messages, internals.buildJob);

      return callback(null, messages);
    }
  });
};

internals.deleteMessage = function (sqs, handle, callback) {
  callback = callback || function () {};

  return sqs.deleteMessage({ ReceiptHandle : handle }, callback);
};

internals.getQueueAttributes = function(sqs, params, callback) {
  sqs.getQueueAttributes(params, callback);
};

module.exports = function (sqs) {
  return {
    send: _.partial(internals.sender, sqs),
    read: _.partial(internals.reader, sqs),
    destroy : _.partial(internals.deleteMessage, sqs),
    getAttributes: _.partial(internals.getQueueAttributes, sqs)
  };
};
