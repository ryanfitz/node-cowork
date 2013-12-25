'use strict';

var Joi = require('joi');


// Declare internals

var internals = {};

var S = Joi.string;

// Validate queue options

exports.queue = function (settings) {

  var error = Joi.validate(settings, internals.queueSchema);
  return (error ? error.annotated() : null);
};

internals.queueSchema = {
  queueURL : S().required().notes('SQS url to use for handling jobs'),
  notifications : Joi.object({
    progressing : S().notes('SNS topic to notify when job has started processing'),
    completed : S().notes('SNS topic to notify when job has finished processing'),
    error : S().notes('SNS topic to notify when job encountered an error during processing')
  }).optional()
};
