# cowork [![Build Status](https://secure.travis-ci.org/ryanfitz/node-cowork.png?branch=master)](http://travis-ci.org/ryanfitz/node-cowork)

job queue backed by AWS

## Getting Started
Install the module with: `npm install cowork`

```javascript
var cowork = require('cowork');

var worker = function (job, callback) {
  console.log('process job', job);
  return callback();
};

var jobs = cowork.createQueue(worker, settings);

jobs.push({foo: 'bar'});

jobs.process();
```

## Documentation
_(Coming soon)_

## Examples
See examples folder

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Ryan Fitzgerald
Licensed under the MIT license.
