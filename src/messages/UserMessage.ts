'use strict';
import { LOG_LEVELS } from "../helpers";

export class UserMessage {
  private config;
  private afterFunc: Function
  private beforeFunc: Function
  private logger;
  private bot;
  private connector;

  constructor(config, bot, logger, connector) {
    this.config = config;
    this.logger = logger;
    this.bot = bot;
    this.connector = connector;
    this.afterFunc = config.after || function (config, bot) {
      return Promise.resolve();
    }
    this.beforeFunc = config.before || function (config, bot) {
      return Promise.resolve();
    }
  }

  //sends use message to instance of bot for processing
  public send(): Promise<any> {
    return new Promise((resolve, reject) => {

      this.logger('User: >> ' + this.config.user, LOG_LEVELS.info);
      this.logger('Iterating to next step from user message');

      this
        .beforeFunc(this.config, this.bot)
        .then(() => {
          if (typeof this.config.user === "function") {
            return this.config.user(this.bot);
          } else {
            return Promise.resolve(this.config.user);
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
            this.connector.onEventHandler([message.toMessage()]);
          } else {
            this.connector.processMessage(message);
          }
          return true;
        })
        .then(() => {
          return this.afterFunc(this.config, this.bot);
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