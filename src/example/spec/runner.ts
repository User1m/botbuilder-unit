process.on('uncaughtException', function (exception) {
  console.log(`Uncaught Exception: ${exception}`);
});

process.on('unhandledRejection', (reason, p) => {
  console.log(`Unhandled Rejection at: Promise ${p}\n reason: ${reason}`);
});

import Jasmine = require('jasmine');
const jasmine = new Jasmine({});
// jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 999999;
const config = require('./support/jasmine');
jasmine.loadConfig(config);
jasmine.configureDefaultReporter({
  showColors: true,
  print: function () { } //Override of the default reporter
});


import * as Reporter from 'jasmine-terminal-reporter';
const reporter = new Reporter({
  isVerbose: true,
});

jasmine.addReporter(reporter);
jasmine.execute(null, null);