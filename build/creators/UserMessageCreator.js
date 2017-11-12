'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const UserMessage_1 = require("../messages/UserMessage");
const consoleConn = 'console';
class UserMessageCreator {
    static factory(config, bot, logger) {
        return new UserMessage_1.UserMessage(config, bot, logger, bot.connector(consoleConn));
    }
}
exports.UserMessageCreator = UserMessageCreator;
//# sourceMappingURL=UserMessageCreator.js.map