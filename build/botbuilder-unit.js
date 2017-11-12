"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const MessageFactory_1 = require("./MessageFactory");
const ConversationMock_1 = require("./ConversationMock");
const chalk_1 = require("chalk");
const functionConst = "function";
const consoleConst = "console";
class BotTestOrchestrator {
    constructor(bot, messages, options) {
        this.options = {
            FINISH_TIMEOUT: 20,
            NEXT_USER_MESSAGE_TIMEOUT: 20,
            DEFAULT_TEST_TIMEOUT: 10000,
            LOG_LEVEL: helpers_1.LOG_LEVELS.verbose,
        };
        this.ConversationMock = ConversationMock_1.ConversationMock;
        this.dependencies = {
            log: (msg, ...args) => {
                if (args[0] === undefined) {
                    args[0] = 2;
                }
                if (args[0] <= this.options.LOG_LEVEL) {
                    console.log(msg);
                }
            }
        };
        this.step = 0;
        this.botMessageStore = [];
        this.botMessageValidationStore = [];
        this.bot = bot;
        this.messages = messages.slice(0);
        this.options = Object.assign(this.options, options);
    }
    callCustomScriptFunction(scriptObj, bot, customFunctionType, args) {
        if (typeof scriptObj[customFunctionType] === functionConst) {
            scriptObj[customFunctionType](this.bot, args);
        }
    }
    _d(key) {
        return this.dependencies[key];
    }
    printInputScriptStart() {
        this._d('log')("\n---------------------------------- INPUT SCRIPT --------------------------------------\n", helpers_1.LOG_LEVELS.info);
        let intro = '';
        this.messages.forEach((item, i) => {
            item = Object.assign({}, item);
            for (var key in item) {
                if (item.hasOwnProperty(key) && (functionConst == typeof (item[key]))) {
                    item[key] = '[[Function]]';
                }
            }
            intro += `${i}: ${JSON.stringify(item)}\n`;
        });
        intro += '\n--------------------------------------------------------------------------------------\n';
        this._d('log')(intro, helpers_1.LOG_LEVELS.info);
    }
    printScriptFinished(resolve) {
        var finished = '--------------------------------------------------------------------------------------';
        finished += `\nSCRIPT FINISHED\n`;
        finished += '--------------------------------------------------------------------------------------';
        this._d('log')(finished, helpers_1.LOG_LEVELS.info);
        setTimeout(resolve, this.options.FINISH_TIMEOUT);
    }
    processNextScriptMsg() {
        return this.messages.shift();
    }
    checkNextScriptMsgActor() {
        return (this.messages[0].user) ? helpers_1.ACTORS.user : helpers_1.ACTORS.bot;
    }
    validateBotMessages(checkNextMsgCb) {
        const _this = this;
        return new Promise((resolve, reject) => {
            for (var index = 0; index < _this.botMessageStore.length; index++) {
                const scriptObj = _this.botMessageValidationStore[index];
                MessageFactory_1.MessageFactory
                    .bot(scriptObj, _this.bot, _this._d('log'))
                    .validate(_this.botMessageStore[index])
                    .then(() => {
                    _this.botMessageStore = [];
                    _this.botMessageValidationStore = [];
                    checkNextMsgCb();
                }).catch((err) => {
                    reject(err);
                });
            }
        });
    }
    startTesting(resolve, reject, step) {
        if (this.messages.length) {
            this.printInputScriptStart();
            this.userMessageBot(resolve, reject);
        }
        else {
            this._d('log')(chalk_1.default.red("NOTHING TO TEST"));
            resolve();
        }
    }
    getNextScriptMsg(resolve, reject, step) {
        if (!this.messages.length) {
            this.printScriptFinished(resolve);
            return;
        }
        if (this.checkNextScriptMsgActor() === helpers_1.ACTORS.user) {
            this.step++;
            this.userMessageBot(resolve, reject);
        }
    }
    userMessageBot(resolve, reject) {
        let scriptObj = this.processNextScriptMsg();
        const logger = this._d('log');
        const _this = this;
        setTimeout(() => {
            _this._d('log')(`\nStep: #${_this.step}`);
            MessageFactory_1.MessageFactory.user(scriptObj, _this.bot, logger)
                .send()
                .catch(function (err) {
                reject(err);
            });
        }, 10);
    }
    setupBotReplyCatcherEvent(resolve, reject, step) {
        const _this = this;
        this.bot.on('send', function (message) {
            if (_this.botMessageStore.length == 0) {
                _this._d('log')(`\nStep: #${_this.step}\nReceived message from bot:`);
            }
            if (_this.checkNextScriptMsgActor() === helpers_1.ACTORS.bot) {
                _this.botMessageStore.push(message);
                _this.botMessageValidationStore.push(_this.processNextScriptMsg());
                if (_this.messages.length == 0 || _this.checkNextScriptMsgActor() === helpers_1.ACTORS.user) {
                    setTimeout(() => {
                        _this.validateBotMessages(() => {
                            _this.getNextScriptMsg(resolve, reject, step);
                        });
                    }, 100);
                }
            }
        });
    }
    run() {
        const _this = this;
        return new Promise(function (resolve, reject) {
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
function runTest(bot, messages, options) {
    return new BotTestOrchestrator(bot, messages, options).run();
}
exports.runTest = runTest;
//# sourceMappingURL=botbuilder-unit.js.map