'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BotMessage_1 = require("../messages/BotMessage");
class BotMessageCreator {
    static factory(scriptObj, bot, logger) {
        return new BotMessage_1.BotMessage(scriptObj, bot, logger);
    }
}
exports.BotMessageCreator = BotMessageCreator;
//# sourceMappingURL=BotMessageCreator.js.map