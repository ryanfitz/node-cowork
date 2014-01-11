'use strict';

var Joi = require('joi');


// Declare internals

var internals = {};

var S = Joi.string;
var N = Joi.number;

// Validate queue options

exports.queue = function (settings) {
  settings = settings || {};

  var error = Joi.validate(settings, internals.queueSchema);
  return (error ? error.annotated() : null);
};

internals.queueSchema = {
  accessKeyId : S().notes('AWS access key').with('secretAccessKey'),
  secretAccessKey : S().notes('AWS secret key').with('accessKeyId'),
  region : S().notes('AWS region'),
  queueURL : S().required().notes('SQS url to use for handling jobs'),
  concurrency : N().min(1).notes('Number of worker functions that should be run in parallel'),
  retryInterval : N().min(1).notes('Number of seconds to delay a message for next retry attempt'),
  notifications : Joi.object({
    progressing : S().notes('SNS topic to notify when job has started processing'),
    completed : S().notes('SNS topic to notify when job has finished processing'),
    error : S().notes('SNS topic to notify when job encountered an error during processing')
  }).optional()
};
