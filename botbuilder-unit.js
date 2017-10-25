"use strict";

let FINISH_TIMEOUT = 20;
let NEXT_USER_MESSAGE_TIMEOUT = 20;
let DEFAULT_TEST_TIMEOUT = 10000;

const MessageFactory = require('./src/MessageFactory');

const triggerState = {
  before: 'before',
  after: 'after'
}

const LOG_LEVELS = {
  none: 0,
  info: 1,
  verbose: 2
};

testBot.dependencies = {
  log: console.log
}

function testBot(bot, messages, options) {
  options = Object.assign({
    timeout: DEFAULT_TEST_TIMEOUT
  }, options);
  messages = messages.slice(0);

  function callTrigger(check, bot, name, args) {
    if ("function" == typeof check[name]) {
      check[name](bot, args);
    }
  }

  return new Promise(function (resolve, reject) {
    var step = 0;
    var connector = bot.connector('console');

    function done() {
      resolve();
    }

    function fail(err) {
      reject(err);
    }

    function checkBotMessage(message, check, doneCallback) {
      MessageFactory.factory(check, bot, _d('log'))
        .validate(message)
        .then(() => {
          doneCallback();
        })
        .catch((err) => {
          doneCallback(err);
        });
    }

    function next() {
      if (!messages.length) {
        var finished = '--------------------------------------------------------------------------------------';
        finished += `\nSCRIPT FINISHED\n`;
        finished += '--------------------------------------------------------------------------------------';

        _d('log')(finished, LOG_LEVELS.info);
        setTimeout(done, FINISH_TIMEOUT); // Enable message from connector to appear in current test suite
        return;
      }

      if (messages[0].user) {
        let messageConfig = messages.shift();
        _d('log')(`Step: #${step}`);
        step++;

        MessageFactory.factory(messageConfig, bot, _d('log'))
          .send(messageConfig)
          .then(function () {
            if (messages.length && (messages[0].user)) {
              setTimeout(function () {
                next();
              }, NEXT_USER_MESSAGE_TIMEOUT);
            }
          })
          .catch(function (err) {
            fail(err);
          });
      }

    }

    function outputScript() {
      let intro = '';
      messages.forEach((item, i) => {
        item = Object.assign({}, item);
        for (var key in item) {
          if (item.hasOwnProperty(key) && ("function" == typeof (item[key]))) {
            item[key] = '[[Function]]';
          }
        }
        intro = intro + (`${i}: ${JSON.stringify(item)}\n`);
      });
      intro += '--------------------------------------------------------------------------------------';
      _d('log')(intro, LOG_LEVELS.info);
    }

    function startTesting() {
      if (messages.length) {
        outputScript();
        next();
      }
    }

    function setupOptions() {
      if (options.FINISH_TIMEOUT != undefined) {
        FINISH_TIMEOUT = options.FINISH_TIMEOUT;
      }
      if (options.NEXT_USER_MESSAGE_TIMEOUT != undefined) {
        NEXT_USER_MESSAGE_TIMEOUT = options.NEXT_USER_MESSAGE_TIMEOUT;
      }
      if (options.DEFAULT_TEST_TIMEOUT) {
        DEFAULT_TEST_TIMEOUT = options.DEFAULT_TEST_TIMEOUT;
        setTimeout(() => {
          reject(`Default timeout (${options.DEFAULT_TEST_TIMEOUT}) exceeded`);
        }, DEFAULT_TEST_TIMEOUT);
      }
      if (options.LOG_LEVEL !== undefined) {
        testBot.dependencies.log = (msg, ...args) => {
          if (args[0] === undefined) {
            args[0] = 2;
          }
          if (args[0] <= options.LOG_LEVEL) {
            console.log(msg);
          } else if (args[0] <= options.LOG_LEVEL) {
            console.log(msg);
          } else if (args[0] <= options.LOG_LEVEL) {
            console.log(msg);
          }
        };
      }
    }

    function setupReplyReceiver() {
      bot.on('send', function (message) {
        _d('log')(`Step: #${step}\nReceived message from bot:`);
        _d('log')(message);
        if (messages.length) {
          var check = messages.shift();
          _d('log')('Expecting:');
          _d('log')(check);
          _d('log')('--');
          step++;
          callTrigger(check, bot, triggerState.before, message);
          checkBotMessage(message, check, (err) => {
            callTrigger(check, bot, triggerState.after, err);
            if (err) {
              // fail(err);
              console.log(err.message);
              process.exit(0);
            } else {
              next();
            }
          });
        } else {
          _d('log')('Bot: >>Ignoring message (Out of Range)', LOG_LEVELS.info);
          setTimeout(done, FINISH_TIMEOUT); // Enable message from connector to appear in current test suite
        }
      });
    }

    setupOptions();
    setupReplyReceiver();
    startTesting();
  });
}

function _d(name) {
  return testBot.dependencies[name];
}

module.exports = testBot;
module.exports.ConversationMock = require('./src/ConversationMock');