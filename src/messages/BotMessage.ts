import { default as chalk } from 'chalk';
import { LOG_LEVELS, ScriptObj } from "../helpers";
import { UniversalBot } from "botbuilder";
import * as colors from 'colors';
import * as jsdiff from 'diff';


export class BotMessage {
  private scriptObj: ScriptObj;
  private beforeFunction: Function
  private afterFunction: Function
  private logger;
  private bot: UniversalBot;

  constructor(scriptObj: ScriptObj, bot: UniversalBot, logger: any) {
    this.scriptObj = scriptObj;
    this.bot = bot;
    this.logger = logger;
    this.beforeFunction = scriptObj.before || function () {
      // this.logger("------------ Finished Before Function \n", LOG_LEVELS.info);
      return Promise.resolve();
    }
    this.afterFunction = scriptObj.after || function () {
      // this.logger("------------ Finished After Function\n", LOG_LEVELS.info);
      return Promise.resolve();
    };
  }

  private printErrorMsg(actual, expected): string {
    var errorMsg = `\n--------------------------------------------------------------------------------------\n`;
    errorMsg += chalk.red("ERROR:\n");
    errorMsg += `\nActual: ${chalk.red(actual)}\n\n`;
    errorMsg += `${chalk.yellow("\t------- did not match -------")}\n\n`;
    errorMsg += `Expect: ${chalk.green(expected)}\n `;
    errorMsg += `\n--------------------------------------------------------------------------------------\n`;
    return errorMsg;
  }

  public validate(botMessage) {
    const _this = this;

    return new Promise((resolve: Function, reject: Function) => {
      _this.beforeFunction(_this.scriptObj, _this.bot)
        .then(() => {
          if (_this.scriptObj.bot) {
            if (typeof _this.scriptObj.bot === 'function') {
              return _this.scriptObj.bot(_this.bot, botMessage);
            } else {
              if (_this.scriptObj.bot) {
                _this.logger(chalk.yellow(`BOT EXPECT: >> ${_this.scriptObj.bot}\n`), LOG_LEVELS.info);
                let result = ((_this.scriptObj.bot as any).test ?
                  (_this.scriptObj.bot as any).test(botMessage.text) : botMessage.text === _this.scriptObj.bot);
                if (!result) {
                  const actual = botMessage.text;
                  const expected = _this.scriptObj.bot;
                  const err = _this.printErrorMsg(actual, expected);
                  // throw err;
                  reject(err);
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
          return _this.afterFunction(_this.scriptObj, _this.bot);
        })
        .then(() => {
          if (botMessage.text) {
            _this.logger(chalk.green(`BOT ACTUAL: >> ${(botMessage.text)}\n`), LOG_LEVELS.info);
          } else {
            _this.logger(chalk.green(`BOT ACTUAL: >> ${JSON.stringify(botMessage)}\n`), LOG_LEVELS.info);
          }
          resolve();
        })
        .catch((err) => {
          _this.logger("Test Failed Rejecting....");
          reject(err);
        });
    });
  };
}