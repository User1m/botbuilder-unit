"use strict";

import { LOG_LEVELS, TRIGGER_STATE, ACTORS, TestOptions, ScriptObj } from "./helpers";
import { MessageFactory } from './MessageFactory';
import { ConversationMock } from './ConversationMock';
import { BotMessage } from './messages/BotMessage';
import { default as chalk } from 'chalk';
import { UniversalBot } from "botbuilder";

const functionConst = "function";
const consoleConst = "console";

class BotTestOrchestrator {
  private logger: any;
  private options: TestOptions = {
    FINISH_TIMEOUT: 20,
    NEXT_USER_MESSAGE_TIMEOUT: 20,
    DEFAULT_TEST_TIMEOUT: 10000,
    LOG_LEVEL: LOG_LEVELS.verbose,
  }
  private messages: ScriptObj[];
  private bot: UniversalBot;
  // private scriptDone = false;
  public ConversationMock = ConversationMock;
  private dependencies = {
    log: (msg, ...args) => {
      if (args[0] === undefined) {
        args[0] = 2;
      }
      if (args[0] <= this.options.LOG_LEVEL) {
        console.log(msg);
      }
    }
  };
  private step: number = 0;

  constructor(bot, messages: ScriptObj[], options) {
    this.bot = bot;
    this.messages = messages.slice(0);
    this.options = Object.assign(this.options, options);
  }

  // private done(resolve) {
  //   resolve();
  // }
  // private fail(reject, err) {
  //   reject(err);
  // }

  private callCustomScriptFunction(scriptObj, bot, customFunctionType, args) {
    if (typeof scriptObj[customFunctionType] === functionConst) {
      scriptObj[customFunctionType](this.bot, args);
    }
  }

  private _d(key) {
    return this.dependencies[key];
  }


  private printInputScriptStart() {
    this._d('log')("\n---------------------------------- INPUT SCRIPT --------------------------------------\n", LOG_LEVELS.info);
    let intro = '';
    this.messages.forEach((item, i) => {
      item = Object.assign({}, item);
      for (var key in item) {
        if (item.hasOwnProperty(key) && ("function" == typeof (item[key]))) {
          item[key] = '[[Function]]';
        }
      }
      intro += `${i}: ${JSON.stringify(item)}\n`;
    });
    intro += '\n--------------------------------------------------------------------------------------\n';
    this._d('log')(intro, LOG_LEVELS.info);
  }

  private printScriptFinished(resolve) {
    var finished = '--------------------------------------------------------------------------------------';
    finished += `\nSCRIPT FINISHED\n`;
    finished += '--------------------------------------------------------------------------------------';

    this._d('log')(finished, LOG_LEVELS.info);
    setTimeout(resolve, this.options.FINISH_TIMEOUT); // Enable message from connector to appear in current test suite
  }

  private processNextScriptMsg(): any {
    return this.messages.shift();
  }

  private checkNextScriptMsgActor(): string {
    return (this.messages[0].user) ? ACTORS.user : ACTORS.bot;
  }

  private validateBotMsgWithExpected(message, scriptObj, checkNextMsgCb) {
    const _this = this;
    MessageFactory
      .bot(scriptObj, _this.bot, _this._d('log'))
      .validate(message)
      .then(() => {
        checkNextMsgCb();
      })
      .catch((err) => {
        checkNextMsgCb(err);
      });
  }

  private startTesting(resolve: Function, reject: Function, step: number) {
    if (this.messages.length) {
      this.printInputScriptStart();
      // this.getNextScriptMsg(resolve, reject, step);
      this.userMessageBot(resolve, reject);
    } else {
      console.log(chalk.red("NOTHING TO TEST"));
      resolve();
    }
  }

  private getNextScriptMsg(resolve: Function, reject: Function, step: number) {
    if (!this.messages.length) {
      this.printScriptFinished(resolve);
      return;
    }
    // if (this.checkNextScriptMsgActor() == ACTORS.user) {
    //   this.userMessageBot(resolve, reject, step);
    // }
    if (this.checkNextScriptMsgActor() === ACTORS.bot) {
      // const scriptObj = this.processNextScriptMsg();
      // this.getNextScriptMsg(resolve, reject, step);
      return;
    } else if (this.checkNextScriptMsgActor() === ACTORS.user) {
      // const _this = this;
      // setTimeout(function () {
      this.step++;
      this.userMessageBot(resolve, reject);
      // }, 10);
    }
  }

  private userMessageBot(resolve: Function, reject: Function) {
    let scriptObj = this.processNextScriptMsg();
    this._d('log')(`Step: #${this.step}`);

    const logger = this._d('log');
    const _this = this;
    MessageFactory.user(scriptObj, this.bot, logger)
      .send()
      // .then(function () {
      //   if (_this.messages.length && (_this.messages[0].user)) {
      //     setTimeout(function () {
      //       _this.getNextScriptMsg(resolve, reject, step);
      //     }, 10000);
      //   }
      // })
      .catch(function (err) {
        reject(err);
      });
  }

  private setupBotReplyCatcherEvent(resolve: Function, reject: Function, step: number) {
    const _this = this;
    this.bot.on('send', function (message) {
      _this._d('log')(`\nStep: #${_this.step}\nReceived message from bot:`);
      // _this._d('log')(message.text);
      // if (_this.messages.length) {
      //   if (_this.messages[0].bot) {
      //     _this._d('log')('Expecting:');
      //     _this._d('log')(scriptObj);
      //     _this._d('log')('--');
      //     _this.callCustomScriptFunction(scriptObj, _this.bot, TRIGGER_STATE.before, message);
      //     _this.validateBotMsgWithExpected(message, scriptObj, (err) => {
      //       _this.callCustomScriptFunction(scriptObj, _this.bot, TRIGGER_STATE.after, err);
      //       if (err !== undefined) {
      //         // fail(err);
      //         _this._d('log')(err.message);
      //         process.exit(0);
      //       } else {
      // _this.getNextScriptMsg(resolve, reject, step);
      if (_this.checkNextScriptMsgActor() === ACTORS.bot) {
        const scriptObj = _this.processNextScriptMsg();
        _this.validateBotMsgWithExpected(message, scriptObj, () => {
          _this.getNextScriptMsg(resolve, reject, step);
        });
      } else {
        reject("NOT A BOT REPLY TO TEST");
      }
      //       }
      //     });
      //   }
      //   // else {
      //   //   _this.userMessageBot(resolve, reject, step);
      //   // }
      // } else {
      //   _this._d('log')('Bot: >> Ignoring message (Out of Range)', LOG_LEVELS.info);
      //   // setTimeout(resolve, FINISH_TIMEOUT); // Enable message from connector to appear in current test suite
      // }
    });
  }


  public run(): Promise<any> {
    const _this = this;
    return new Promise(function (resolve: Function, reject: Function) {
      const step = 0;
      const connector = _this.bot.connector(consoleConst);

      setTimeout(() => {
        reject(`Default timeout (${_this.options.DEFAULT_TEST_TIMEOUT}) exceeded`);
      }, _this.options.DEFAULT_TEST_TIMEOUT);

      _this.setupBotReplyCatcherEvent(resolve, reject, step);
      _this.startTesting(resolve, reject, step);
    });
  }
}


export function runTest(bot: UniversalBot, messages: any, options: TestOptions) {
  return new BotTestOrchestrator(bot, messages, options).run()
}