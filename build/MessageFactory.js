"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BotMessageCreator_1 = require("./creators/BotMessageCreator");
const UserMessageCreator_1 = require("./creators/UserMessageCreator");
class MessageFactory {
    static bot(scriptMsg, bot, logger) {
        if (scriptMsg.bot || scriptMsg.endConversation || scriptMsg.typing) {
            return BotMessageCreator_1.BotMessageCreator.factory(scriptMsg, bot, logger);
        }
        throw new Error(`Not a Bot Object or Unsupported config - ${JSON.stringify(scriptMsg)}`);
    }
    static user(scriptMsg, bot, logger) {
        if (scriptMsg.user) {
            return UserMessageCreator_1.UserMessageCreator.factory(scriptMsg, bot, logger);
        }
        throw new Error(`Not a User Object or Unsupported config - ${JSON.stringify(scriptMsg)} `);
    }
}
exports.MessageFactory = MessageFactory;
//# sourceMappingURL=MessageFactory.js.map