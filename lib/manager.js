'use strict';

var async = require('async'),
    util  = require('util'),
    _     = require('lodash');

var internals = {};

internals.runner = function (worker, destroyMessageFun, notifiers) {
  return function (job, callback) {
    notifiers.progress('started processing job', job.data);

    worker(job.data, function (err) {
      if(err) {
        var errmsg = { message: err.message, stack: err.stack };
        notifiers.error('error processing job', {error: errmsg, data: job.data});
      } else {
        notifiers.completed('finished processing job', job.data);
      }

      return destroyMessageFun(job.handle, function (delerr) {
        if(delerr){
          console.log('error deleting message', delerr);
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

  var settings = _.defaults({}, options, {concurrency: 10});

  var runner = internals.runner(worker, queue.destroy, settings.notifiers);
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


