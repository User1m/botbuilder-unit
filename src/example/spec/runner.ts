process.on('uncaughtException', function (exception) {
  console.log(exception);
});
process.on('unhandledRejection', (reason, p) => {
  // console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
  console.log(reason);
});

import Jasmine = require('jasmine');
const jasmine = new Jasmine({});
// jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 999999;
const config = require('./support/jasmine');
jasmine.loadConfig(config);
jasmine.configureDefaultReporter({
  showColors: true
});


import * as Reporter from 'jasmine-terminal-reporter';
const reporter = new Reporter({
  isVerbose: true,
  includeStackTrace: true,
});

jasmine.addReporter(reporter);
jasmine.execute(null, null);