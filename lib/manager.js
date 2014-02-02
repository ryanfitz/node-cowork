'use strict';

var async = require('async'),
    util  = require('util'),
    _     = require('lodash');

var internals = {};

internals.runner = function (worker, destroyMessageFun, retryMessageFun, settings) {
  var notifiers = settings.notifiers;

  return function (job, callback) {
    notifiers.progress('started processing job', job.data);

    worker(job.data, function (err, response) {
      if(err && err.retryable) {
        var timeout = settings.retryInterval;
        if(err.delay) {
          timeout = err.delay;
        }
        return retryMessageFun(timeout, job.handle, callback);
      } else if(err) {
        var errmsg = { message: err.message, stack: err.stack };
        notifiers.error('error processing job', {error: errmsg, data: job.data});
      } else {
        notifiers.completed('finished processing job', {request: job.data, response: response});
      }

      return destroyMessageFun(job.handle, function (delerr) {
        if(delerr) {
          console.log('error deleting message from queue', delerr);
        }

        return callback(err);
      });

    });
  };
};

internals.processJobs = function (queue, jobs, callbacks) {
  var push = function (messages, callback) {
    jobs.push(messages, function () {
      if(callbacks.finished) {
        return callbacks.finished();
      }
    });

    return callback();
  };

  return function (maxMessages, callback) {
    callback = callback || function () {};

    if(jobs.length() >= jobs.concurrency) {
      return callback();
    }

    async.waterfall([
      async.apply(queue.read, maxMessages),
      push
    ], function () {
      return callback();
    });
  };
};

internals.processJobsUntilSaturated = function (processJobs, jobs) {
  var running = false;

  return function (callback) {
    callback = callback || function () {};

    if(running) {
      return callback();
    }

    running = true;

    async.whilst(
      function () { return jobs.length() < jobs.concurrency; },
      function (callback) {
        var max = jobs.concurrency - jobs.length();
        return processJobs(max, callback);
      },
      function (err) {
        running = false;
        if(err) {
          util.error('error processing jobs', err);
          return callback(err);
        }

        return callback();
      }
    );
  };
};

module.exports = function (queue, worker, options) {
  options = options || {};

  var settings = _.defaults({}, options, {concurrency: 10, retryInterval: 5});

  var runnerSettings = {
    notifiers : settings.notifiers,
    retryInterval : settings.retryInterval
  };

  var runner = internals.runner(worker, queue.destroy, queue.retry, runnerSettings);
  var jobs = async.queue(runner, settings.concurrency);

  var callbacks = {
    finished : function () { }
  };

  var processJobs = internals.processJobs(queue, jobs, callbacks);

  var processJobsUntilSaturated = internals.processJobsUntilSaturated(processJobs, jobs);

  callbacks.finished = function () {
    return processJobsUntilSaturated();
  };

  jobs.drain = function () {
    return processJobsUntilSaturated();
  };

  return {
    start : processJobsUntilSaturated
  };
};


