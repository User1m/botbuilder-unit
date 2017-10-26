import { BotMessageCreator } from './creators/BotMessageCreator';
import { UserMessageCreator } from './creators/UserMessageCreator';

export class MessageFactory {
  static botFactory(scriptMsg, bot, logger) {
    if (scriptMsg.bot || scriptMsg.endConversation || scriptMsg.typing) {
      return BotMessageCreator.factory(scriptMsg, bot, logger);
    }
    throw new Error(`Unsupported config - ${JSON.stringify(scriptMsg)}`);
  }
  static userFactory(scriptMsg, bot, logger) {
    if (scriptMsg.user) {
      return UserMessageCreator.factory(scriptMsg, bot, logger);
    }
    throw new Error(`Unsupported config - ${JSON.stringify(scriptMsg)} `);
  }
}