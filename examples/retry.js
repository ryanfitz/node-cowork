'use strict';

var AWS = require('aws-sdk'),
    cowork = require('../lib/cowork');

AWS.config.loadFromPath(process.env.HOME + '/.ec2/credentials.json');

var settings = {
  queueURL : 'https://sqs.us-east-1.amazonaws.com/967397977267/photo-service-dev-PhotoImportQueue-1QWK4DAIXQUE7',
  concurrency: 100, // optional
  retryInterval : 10,
  notifications : { // optional
    error : 'arn:aws:sns:us-east-1:967397977267:PhotoImportFailed'
  }
};

var cnt = 0;
var start = new Date();

var worker = function (job, callback) {
  console.log('basic processing: ', job);
  setTimeout(function () {
    cnt++;
    if(job.foo % 10 === 0) {
      var err = new Error('Failed but retryable');
      err.retryable = true;
      //return callback(err);
      return callback();
    } else {
      console.log('finished', cnt, 'time - ' + (new Date() - start) + 'ms');
      return callback();
    }
  }, 2000);
};

var jobs = cowork.createQueue(worker, settings);

jobs.on('error', function (err) {
  console.log('error', err);
});

var msgs = [];

for(var i = 0; i < 500; i++) {
  msgs.push({foo: i});
}

jobs.push(msgs);

jobs.process();
