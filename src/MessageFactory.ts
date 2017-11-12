import { BotMessageCreator } from './creators/BotMessageCreator';
import { UserMessageCreator } from './creators/UserMessageCreator';
import { BotMessage } from "./messages/BotMessage"
import { UserMessage } from "./messages/UserMessage"

export class MessageFactory {
  static bot(scriptMsg, bot, logger): BotMessage {
    if (scriptMsg.bot || scriptMsg.endConversation || scriptMsg.typing) {
      return BotMessageCreator.factory(scriptMsg, bot, logger);
    }
    throw new Error(`Not a Bot Object or Unsupported config - ${JSON.stringify(scriptMsg)}`);
  }
  static user(scriptMsg, bot, logger): UserMessage {
    if (scriptMsg.user) {
      return UserMessageCreator.factory(scriptMsg, bot, logger);
    }
    throw new Error(`Not a User Object or Unsupported config - ${JSON.stringify(scriptMsg)} `);
  }
}