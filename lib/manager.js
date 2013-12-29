'use strict';

var async = require('async'),
    util  = require('util'),
    _     = require('lodash');

var internals = {};

internals.runner = function (worker, notifiers) {
  return function (job, callback) {
    notifiers.progress('started processing job', job.data);

    worker(job.data, function (err) {
      if(err) {
        var errmsg = { message: err.message, stack: err.stack };
        notifiers.error('error processing job', {error: errmsg, data: job.data});
        job.destroy();
        return callback(err);
      } else {
        notifiers.completed('finished processing job', job.data);
        job.destroy();
        return callback();
      }
    });
  };
};

internals.processJobs = function (queue, jobs) {
  var push = function (messages, callback) {
    jobs.push(messages);
    return callback();
  };

  return function (callback) {
    async.waterfall([
      queue.read,
      push
    ], function () {
      return callback();
    });
  };
};

internals.processJobsForever = function (processJobs, jobs) {
  var processForever =  function () {

    async.whilst(
      function () { return jobs.length() < jobs.concurrency; },
      function (callback) {
        processJobs(callback);
      },
      function (err) {
        if(err) {
          util.error('error processing jobs', err);
        }

        setImmediate(processForever);
      }
    );
  };

  return processForever;
};

module.exports = function (queue, worker, options) {
  options = options || {};

  var settings = _.defaults({}, options, {concurrency: 10});

  var jobs = async.queue(internals.runner(worker, settings.notifiers), settings.concurrency);

  var processJobs = internals.processJobs(queue, jobs);

  return {
    start : internals.processJobsForever(processJobs, jobs)
  };
};


