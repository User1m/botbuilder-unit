"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const helpers_1 = require("../helpers");
const jsdiff = require("diff");
class BotMessage {
    constructor(scriptObj, bot, logger) {
        this.scriptObj = scriptObj;
        this.bot = bot;
        this.logger = logger;
        this.beforeFunction = scriptObj.before || function () {
            return Promise.resolve();
        };
        this.afterFunction = scriptObj.after || function () {
            return Promise.resolve();
        };
    }
    printErrorMsg(actual, expected) {
        var errorMsg = `\n--------------------------------------------------------------------------------------\n`;
        errorMsg += `${chalk_1.default.white("Expect: ")}${chalk_1.default.yellow(expected)}\n\n`;
        errorMsg += chalk_1.default.white(`\t------- did not match -------\n\n`);
        errorMsg += `${chalk_1.default.white("Actual: ")}${chalk_1.default.green(actual)} \n\n`;
        errorMsg += `${chalk_1.default.white("Diffed: ")}`;
        var diff = jsdiff.diffChars(expected, actual);
        diff.forEach(function (part) {
            errorMsg += (part.added ? chalk_1.default.bgGreenBright(chalk_1.default.white(part.value)) :
                part.removed ? chalk_1.default.bgRedBright(chalk_1.default.white(part.value)) : chalk_1.default.gray(part.value));
        });
        errorMsg += `\n--------------------------------------------------------------------------------------\n`;
        return errorMsg;
    }
    validate(botMessage) {
        const _this = this;
        return new Promise((resolve, reject) => {
            _this.beforeFunction(_this.scriptObj, _this.bot)
                .then(() => {
                if (_this.scriptObj.bot) {
                    if (typeof _this.scriptObj.bot === 'function') {
                        return _this.scriptObj.bot(_this.bot, botMessage);
                    }
                    else {
                        if (_this.scriptObj.bot) {
                            _this.logger(chalk_1.default.yellow(`BOT EXPECT: >> ${_this.scriptObj.bot} `), helpers_1.LOG_LEVELS.info);
                            let result = (_this.scriptObj.bot.test ?
                                _this.scriptObj.bot.test(botMessage.text) : botMessage.text === _this.scriptObj.bot);
                            if (!result) {
                                const actual = botMessage.text;
                                const expected = _this.scriptObj.bot;
                                const err = _this.printErrorMsg(actual, expected);
                                fail(new Error(err));
                            }
                        }
                        else {
                            reject(chalk_1.default.yellow(`No input message in: \n${JSON.stringify(_this.scriptObj)} `));
                        }
                        Promise.resolve();
                    }
                }
                else if (_this.scriptObj.endConversation) {
                    _this.logger(`BOT: >> endConversation`, helpers_1.LOG_LEVELS.info);
                    Promise.resolve();
                }
                else if (_this.scriptObj.typing) {
                    _this.logger(`BOT: >> typing`, helpers_1.LOG_LEVELS.info);
                    Promise.resolve();
                }
                else {
                    reject(chalk_1.default.yellow(`Unable to find matching validator.Step scriptObj: \n${JSON.stringify(_this.scriptObj)} `));
                }
            })
                .then(() => {
                return _this.afterFunction(_this.scriptObj, _this.bot);
            })
                .then(() => {
                if (botMessage.text) {
                    _this.logger(chalk_1.default.green(`BOT ACTUAL: >> ${(botMessage.text)} `), helpers_1.LOG_LEVELS.info);
                }
                else {
                    _this.logger(chalk_1.default.green(`BOT ACTUAL: >> ${JSON.stringify(botMessage)} `), helpers_1.LOG_LEVELS.info);
                }
                resolve();
            });
        });
    }
    ;
}
exports.BotMessage = BotMessage;
//# sourceMappingURL=BotMessage.js.map