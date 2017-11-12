'use strict';
import { LOG_LEVELS, ScriptObj } from "../helpers";
import { UniversalBot, IConnector, ConsoleConnector } from "botbuilder";
import { default as chalk } from 'chalk';

const mockConvo = {
  channelId: 'console',
  user: {
    id: 'user',
    name: 'User1'
  },
  bot: {
    id: 'bot',
    name: 'Bot'
  },
  conversation: {
    id: 'Convo1'
  }
};

export class UserMessage {
  private scriptObj: ScriptObj;
  private beforeFunction: Function
  private afterFunction: Function
  private logger;
  private bot: UniversalBot;
  private connector: IConnector;

  constructor(scriptObj: ScriptObj, bot: UniversalBot, logger: any, connector: IConnector) {
    this.scriptObj = scriptObj;
    this.logger = logger;
    this.bot = bot;
    this.connector = connector;
    this.beforeFunction = scriptObj.before || function (scriptObj, bot) {
      return Promise.resolve();
    }
    this.afterFunction = scriptObj.after || function (scriptObj, bot) {
      return Promise.resolve();
    }
  }

  //sends use message to instance of bot for processing
  public send(): Promise<any> {
    const _this = this;
    return new Promise((resolve, reject) => {

      _this.logger(chalk.cyanBright('User: >> ' + _this.scriptObj.user), LOG_LEVELS.info);
      _this.logger('Iterating to next step from user message');

      _this.beforeFunction(_this.scriptObj, _this.bot)
        .then(() => {
          if (typeof _this.scriptObj.user === "function") {
            return _this.scriptObj.user(_this.bot);
          } else {
            //move to then branch below
            return Promise.resolve(_this.scriptObj.user);
          }
        })
        .then((message) => {
          if (typeof message === "object") {
            if (!message.data.address) {
              message.address(mockConvo);
            }
            (_this.connector as any).onEventHandler([message.toMessage()]);
          } else {
            //pass message to console connector
            _this.logger("Sending message to bot");
            (_this.connector as ConsoleConnector).processMessage(message);
          }
          // return true;
          return Promise.resolve();
        })
        .then(() => {
          return _this.afterFunction(_this.scriptObj, _this.bot);
        })
        .then(() => {
          _this.logger("Resolving");
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

}