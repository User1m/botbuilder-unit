import { default as chalk } from 'chalk';
import { LOG_LEVELS } from "../helpers";

export class BotMessage {
  private scriptObj;
  private customAfterScriptMsgFunc: Function
  private customBeforeScriptMsgFunc: Function
  private logger;
  private bot;
  private connector;

  constructor(scriptObj, bot, logger) {
    this.scriptObj = scriptObj;
    this.bot = bot;
    this.logger = logger;
    this.customBeforeScriptMsgFunc = this.scriptObj.before || function () {
      // this.logger("\n", LOG_LEVELS.info);
      return Promise.resolve();
    }
    this.customAfterScriptMsgFunc = this.scriptObj.after || function () {
      this.logger("\n", LOG_LEVELS.info);
      return Promise.resolve();
    };
  }

  public validate(botMessage) {
    const _this = this;

    return new Promise((resolve: Function, reject: Function) => {
      _this.customBeforeScriptMsgFunc(_this.scriptObj, _this.bot)
        .then(() => {
          if (_this.scriptObj.bot) {
            if (typeof _this.scriptObj.bot === 'function') {
              return _this.scriptObj.bot(_this.bot, botMessage);
            } else {
              if (_this.scriptObj.bot) {
                _this.logger(`\nBOT EXPECT: >> ${_this.scriptObj.bot}`, LOG_LEVELS.info);
                let result = (_this.scriptObj.bot.test ? _this.scriptObj.bot.test(botMessage.text) : botMessage.text === _this.scriptObj.bot);
                if (!result) {
                  var errorMsg = `\n--------------------------------------------------------------------------------------\n `;
                  errorMsg += chalk.red("ERROR:\n");
                  errorMsg += `\nActual: ${chalk.red(botMessage.text)}\n\n`;
                  errorMsg += `${chalk.yellow("\t------- did not match -------")}\n\n`;
                  errorMsg += `Expect: ${chalk.green(_this.scriptObj.bot)}\n `;
                  throw new Error(errorMsg);
                  // reject(error);
                }
              } else {
                reject(chalk.yellow(`No input message in: \n${JSON.stringify(_this.scriptObj)}`));
              }
              // return true;
              Promise.resolve();
            }
          } else if (_this.scriptObj.endConversation) {
            _this.logger(`BOT: >> endConversation `, LOG_LEVELS.info);
            // return true;
            Promise.resolve();
          } else if (_this.scriptObj.typing) {
            _this.logger(`BOT: >> typing `, LOG_LEVELS.info);
            // return true;
            Promise.resolve();
          } else {
            reject(chalk.yellow(`Unable to find matching validator. Step scriptObj: \n${JSON.stringify(_this.scriptObj)}`));
          }
        })
        .then(() => {
          return _this.customAfterScriptMsgFunc(_this.scriptObj, _this.bot);
        })
        .then(() => {
          if (botMessage.text) {
            _this.logger(`BOT ACTUAL1: >> ${(botMessage.text)}\n`, LOG_LEVELS.info);
          } else {
            _this.logger(`BOT ACTUAL2: >> ${JSON.stringify(botMessage)}\n`, LOG_LEVELS.info);
          }
          resolve();
        })
        .catch((err) => {
          console.log("Test Failed Rejecting....");
          reject(err);
        });
    });
  };
}