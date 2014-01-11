/*
 * cowork
 * https://github.com/ryanfitz/node-cowork
 *
 * Copyright (c) 2013 Ryan Fitzgerald
 * Licensed under the MIT license.
 */

'use strict';

var Schema       = require('./schema'),
    AWS          = require('aws-sdk'),
    _            = require('lodash'),
    queue        = require('./queue'),
    manager      = require('./manager'),
    notifier     = require('./notifier'),
    EventEmitter = require('events').EventEmitter,
    assert       = require('assert');

var internals = {};

internals.sqs = function (queueURL) {
  return new AWS.SQS({
    params: {QueueUrl: queueURL}
  });
};

internals.identity = function () { };

internals.push = function(emitter, queue, data, callback) {
  callback = callback || internals.identity;

  queue.send(data, function (err) {
    if(err) {
      emitter.emit('error', err);
      return callback(err);
    } else {
      return callback();
    }
  });
};

internals.queue = function (queue, processJobs) {
  var result = new EventEmitter();

  result.push = _.partial(internals.push, result, queue);
  result.process = processJobs;

  return result;
};

internals.notifications = function (options) {
  options = options || {};

  var sns = new AWS.SNS();

  return {
    progress : notifier(sns, options.progressing),
    completed : notifier(sns, options.completed),
    error : notifier(sns, options.error)
  };
};

internals.jobProcessor = function (queue, worker, options) {
  options = options || {};

  if(worker) {
    var opts = {
      concurrency : options.concurrency,
      retryInterval : options.retryInterval,
      notifiers : internals.notifications(options.notifications)
    };

    return manager(queue, worker, opts).start;
  } else {
    return internals.identity;
  }
};

internals.credentials = function (settings) {
  return _.pick(settings,'accessKeyId', 'secretAccessKey', 'region');
};

exports.createQueue = function(worker, settings) {
  assert(arguments.length <= 2, 'Too many arguments');

  if(_.isPlainObject(worker) && !settings) {
    settings = worker;
    worker = null;
  }

  assert(settings, 'Bad arguments: Settings is required');

  var schemaError = Schema.queue(settings);
  assert(!schemaError, 'Invalid queue options: ' + schemaError);

  AWS.config.update(internals.credentials(settings));

  var q = queue(internals.sqs(settings.queueURL));

  var processJobs = internals.jobProcessor(q, worker, settings);

  return internals.queue(q, processJobs);
};

