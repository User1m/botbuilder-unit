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
    // this.messages = this.messages.slice(0);
    this.setupOptions();
  }

  // private done(resolve) {
  //   resolve();
  // }
  // private fail(reject, err) {
  //   reject(err);
  // }

  private callCustomScriptFunction(scriptObj, bot, customFunctionType, args) {
    if (typeof scriptObj[customFunctionType] === "function") {
      scriptObj[customFunctionType](this.bot, args);
    }
  }

  private _d(key) {
    return this.dependencies[key];
  }

  private printInputScriptInfo() {
    this._d('log')("\n---------------------------------- INPUT SCRIPT --------------------------------------\n", LOG_LEVELS.info);
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
    intro += '\n--------------------------------------------------------------------------------------\n';
    this._d('log')(intro, LOG_LEVELS.info);
  }

  private compareBotMessageWithExpected(message, scriptObj, doneCallback) {
    const _this = this;
    MessageFactory
      .botFactory(scriptObj, _this.bot, _this._d('log'))
      .validate(message)
      .then(() => {
        doneCallback();
      })
      .catch((err) => {
        doneCallback(err);
      });
  }

  private startTesting(resolve: Function, reject: Function, step: number) {
    if (this.messages.length) {
      this.printInputScriptInfo();
      this.goToNextScriptObj(resolve, reject, step);
    }
  }

  private printScriptEnd(resolve) {
    var finished = '--------------------------------------------------------------------------------------';
    finished += `\nSCRIPT FINISHED\n`;
    finished += '--------------------------------------------------------------------------------------';

    this._d('log')(finished, LOG_LEVELS.info);
    setTimeout(resolve, FINISH_TIMEOUT); // Enable message from connector to appear in current test suite
  }

  private goToNextScriptObj(resolve: Function, reject: Function, step: number) {
    if (!this.messages.length) {
      this.printScriptEnd(resolve);
      return;
    }
    this.userMessageBot(resolve, reject, step);
  }

  private userMessageBot(resolve: Function, reject: Function, step: number) {
    if (this.messages[0].user) {
      let scriptObj = this.processScripMsg();
      this._d('log')(`Step: #${step}`);
      step++;

      const logger = this._d('log');
      const _this = this;
      MessageFactory.userFactory(scriptObj, this.bot, logger)
        // .send(scriptObj)
        .send()
        .then(function () {
          // if (_this.messages.length && (_this.messages[0].user)) {
          //   setTimeout(function () {
          _this.userMessageBot(resolve, reject, step);
          //   }, NEXT_USER_MESSAGE_TIMEOUT);
          // }
        })
        .catch(function (err) {
          reject(err);
        });
    } else {
      console.log("MESSAGE-0");
      console.log(JSON.stringify(this.messages[0]));
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

  private catchBotReplies(resolve: Function, reject: Function, step: number) {
    const _this = this;
    this.bot.on('send', function (message) {
      _this._d('log')(`Step: #${step}\nReceived message from bot:`);
      _this._d('log')(message);
      if (_this.messages.length) {
        if (_this.messages[0].bot) {
          const scriptObj = _this.processScripMsg();
          _this._d('log')('Expecting:');
          _this._d('log')(scriptObj);
          _this._d('log')('--');
          step++;
          _this.callCustomScriptFunction(scriptObj, _this.bot, TRIGGER_STATE.before, message);
          _this.compareBotMessageWithExpected(message, scriptObj,
            (err) => {
              _this.callCustomScriptFunction(scriptObj, _this.bot, TRIGGER_STATE.after, err);
              if (err !== undefined) {
                // fail(err);
                _this._d('log')(err.message);
                process.exit(0);
              } else {
                // _this.userMessageBot(resolve, reject, step);
                _this.goToNextScriptObj(resolve, reject, step);
              }
            });
        }
        // else {
        //   _this.userMessageBot(resolve, reject, step);
        // }
      } else {
        _this._d('log')('Bot: >>Ignoring message (Out of Range)', LOG_LEVELS.info);
        setTimeout(resolve, FINISH_TIMEOUT); // Enable message from connector to appear in current test suite
      }
    });
  }

  private processScripMsg(): any {
    return this.messages.shift();
  }

  public run(): Promise<any> {
    const _this = this;
    return new Promise(function (resolve: Function, reject: Function) {
      const step = 0;
      const connector = _this.bot.connector('console');

      setTimeout(() => {
        reject(`Default timeout (${_this.options.DEFAULT_TEST_TIMEOUT}) exceeded`);
      }, DEFAULT_TEST_TIMEOUT);

      _this.catchBotReplies(resolve, reject, step);
      _this.startTesting(resolve, reject, step);
    });
  }
}
