"use strict";

import { LOG_LEVELS, TRIGGER_STATE } from "./helpers";
import { MessageFactory } from './MessageFactory';
import { ConversationMock } from './ConversationMock';
import { BotMessage } from './messages/BotMessage';

let FINISH_TIMEOUT = 20;
let NEXT_USER_MESSAGE_TIMEOUT = 20;
let DEFAULT_TEST_TIMEOUT = 10000;
let LOG_LEVEL = LOG_LEVELS.verbose;

export class TestBot {
  private logger;
  private options;
  private messages;
  private bot;
  public ConversationMock = ConversationMock;
  private dependencies = {
    log: (msg, ...args) => {
      if (args[0] === undefined) {
        args[0] = 2;
      }
      if (args[0] <= LOG_LEVEL) {
        console.log(msg);
      }
    }
  };

  constructor(bot, messages, options) {
    this.bot = bot;
    this.messages = messages;
    this.options = options;

    this.init();
    // return this.run();
  }

  private init() {
    this.messages = this.messages.slice(0);
    this.setupOptions();
  }

  private done(resolve) {
    resolve();
  }

  private fail(reject, err) {
    reject(err);
  }

  private callTrigger(check, bot, name, args) {
    if ("function" == typeof check[name]) {
      check[name](this.bot, args);
    }
  }

  private _d(name) {
    return this.dependencies[name];
  }

  private outputScript() {
    let intro = '';
    this.messages.forEach((item, i) => {
      item = Object.assign({}, item);
      for (var key in item) {
        if (item.hasOwnProperty(key) && ("function" == typeof (item[key]))) {
          item[key] = '[[Function]]';
        }
      }
      intro = intro + (`${i}: ${JSON.stringify(item)}\n`);
    });
    intro += '--------------------------------------------------------------------------------------';
    this._d('log')(intro, LOG_LEVELS.info);
  }

  private checkBotMessage(message, check, doneCallback) {
    MessageFactory
      .botFactory(check, this.bot, this._d('log'))
      .validate(message)
      .then(() => {
        doneCallback();
      })
      .catch((err) => {
        doneCallback(err);
      });
  }

  private startTesting(resolve, reject, step) {
    if (this.messages.length) {
      this.outputScript();
      this.goToNext(resolve, reject, step);
    }
  }

  private goToNext(resolve, reject, step) {
    if (!this.messages.length) {
      var finished = '--------------------------------------------------------------------------------------';
      finished += `\nSCRIPT FINISHED\n`;
      finished += '--------------------------------------------------------------------------------------';

      this._d('log')(finished, LOG_LEVELS.info);
      setTimeout(this.done(resolve), FINISH_TIMEOUT); // Enable message from connector to appear in current test suite
      return;
    }

    if (this.messages[0].user) {
      let messageConfig = this.messages.shift();
      this._d('log')(`Step: #${step}`);
      step++;

      MessageFactory
        .userFactory(messageConfig, this.bot, this._d('log'))
        // .send(messageConfig)
        .send()
        .then(function () {
          if (this.messages.length && (this.messages[0].user)) {
            setTimeout(function () {
              this.goToNext(resolve, reject, step);
            }, NEXT_USER_MESSAGE_TIMEOUT);
          }
        })
        .catch(function (err) {
          this.fail(reject, err);
        });
    }
  }

  private setupOptions() {
    if (this.options.FINISH_TIMEOUT != undefined) {
      FINISH_TIMEOUT = this.options.FINISH_TIMEOUT;
    }
    if (this.options.NEXT_USER_MESSAGE_TIMEOUT != undefined) {
      NEXT_USER_MESSAGE_TIMEOUT = this.options.NEXT_USER_MESSAGE_TIMEOUT;
    }
    if (this.options.DEFAULT_TEST_TIMEOUT) {
      DEFAULT_TEST_TIMEOUT = this.options.DEFAULT_TEST_TIMEOUT;
    }
    if (this.options.LOG_LEVEL !== undefined) {
      LOG_LEVEL = this.options.LOG_LEVEL;
    }
  }

  private setupReplyReceiver(resolve: Function, reject: Function, step: number) {
    this.bot.on('send', function (message) {
      this._d('log')(`Step: #${step}\nReceived message from this.bot:`);
      this._d('log')(message);
      if (this.messages.length) {
        var check = this.messages.shift();
        this._d('log')('Expecting:');
        this._d('log')(check);
        this._d('log')('--');
        step++;
        this.callTrigger(check, this.bot, TRIGGER_STATE.before, message);
        this.checkBotMessage(message, check,
          (err) => {
            this.callTrigger(check, this.bot, TRIGGER_STATE.after, err);
            if (err) {
              // fail(err);
              console.log(err.message);
              process.exit(0);
            } else {
              this.goToNext(resolve, reject, step);
            }
          });
      } else {
        this._d('log')('Bot: >>Ignoring message (Out of Range)', LOG_LEVELS.info);
        setTimeout(this.done(resolve), FINISH_TIMEOUT); // Enable message from connector to appear in current test suite
      }
    });
  }

  public run(): Promise<any> {
    return new Promise(function (resolve, reject) {
      var step = 0;
      var connector = this.this.bot.connector('console');

      this.setupReplyReceiver(resolve, reject, step);
      this.startTesting(resolve, reject, step);

      setTimeout(() => {
        reject(`Default timeout (${this.options.DEFAULT_TEST_TIMEOUT}) exceeded`);
      }, DEFAULT_TEST_TIMEOUT);
    });
  }
}
