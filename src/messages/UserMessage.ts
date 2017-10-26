'use strict';
import { LOG_LEVELS } from "../helpers";

export class UserMessage {
  private scriptObj;
  private customAfterScriptMsgFunc: Function
  private customBeforeScriptMsgFunc: Function
  private logger;
  private bot;
  private connector;

  constructor(scriptObj, bot, logger, connector) {
    this.scriptObj = scriptObj;
    this.logger = logger;
    this.bot = bot;
    this.connector = connector;
    this.customBeforeScriptMsgFunc = scriptObj.before || function (scriptObj, bot) {
      return Promise.resolve();
    }
    this.customAfterScriptMsgFunc = scriptObj.after || function (scriptObj, bot) {
      return Promise.resolve();
    }
  }

  //sends use message to instance of bot for processing
  public send(): Promise<any> {
    const _this = this;
    return new Promise((resolve, reject) => {

      _this.logger('User: >> ' + _this.scriptObj.user, LOG_LEVELS.info);
      _this.logger('Iterating to next step from user message');

      _this
        .customBeforeScriptMsgFunc(_this.scriptObj, _this.bot)
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
              message.address({
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
              });
            }
            _this.connector.onEventHandler([message.toMessage()]);
          } else {
            //pass message to console connector
            _this.connector.processMessage(message);
          }
          return true;
        })
        .then(() => {
          return _this.customAfterScriptMsgFunc(_this.scriptObj, _this.bot);
        })
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

}