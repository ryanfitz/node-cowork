'use strict';

var AWS = require('aws-sdk'),
    cowork = require('../lib/cowork');

AWS.config.loadFromPath(process.env.HOME + '/.ec2/credentials.json');

var settings = {
  queueURL : 'https://sqs.us-east-1.amazonaws.com/967397977267/photo-service-dev-PhotoImportQueue-MG02JH4XV8HN',
  concurrency: 5, // optional
  notifications : { // optional
    error : 'arn:aws:sns:us-east-1:967397977267:PhotoImportFailed'
  }
};

var worker = function (job, callback) {
  console.log('basic processing: ', job);
  setTimeout(callback, 500);
};

var jobs = cowork.createQueue(worker, settings);

jobs.on('error', function (err) {
  console.log('error', err);
});

for(var i = 0; i < 50; i++) {
  jobs.push({foo: i});
}

jobs.process();
