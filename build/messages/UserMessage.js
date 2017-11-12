'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
const chalk_1 = require("chalk");
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
class UserMessage {
    constructor(scriptObj, bot, logger, connector) {
        this.scriptObj = scriptObj;
        this.logger = logger;
        this.bot = bot;
        this.connector = connector;
        this.beforeFunction = scriptObj.before || function (scriptObj, bot) {
            return Promise.resolve();
        };
        this.afterFunction = scriptObj.after || function (scriptObj, bot) {
            return Promise.resolve();
        };
    }
    send() {
        const _this = this;
        return new Promise((resolve, reject) => {
            _this.logger(chalk_1.default.cyanBright('User: >> ' + _this.scriptObj.user), helpers_1.LOG_LEVELS.info);
            _this.logger('Iterating to next step from user message');
            _this.beforeFunction(_this.scriptObj, _this.bot)
                .then(() => {
                if (typeof _this.scriptObj.user === "function") {
                    return _this.scriptObj.user(_this.bot);
                }
                else {
                    return Promise.resolve(_this.scriptObj.user);
                }
            })
                .then((message) => {
                if (typeof message === "object") {
                    if (!message.data.address) {
                        message.address(mockConvo);
                    }
                    _this.connector.onEventHandler([message.toMessage()]);
                }
                else {
                    _this.logger("Sending message to bot");
                    _this.connector.processMessage(message);
                }
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
exports.UserMessage = UserMessage;
//# sourceMappingURL=UserMessage.js.map