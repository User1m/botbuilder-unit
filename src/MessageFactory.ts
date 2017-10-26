import { BotMessageCreator } from './creators/BotMessageCreator';
import { UserMessageCreator } from './creators/UserMessageCreator';

export class MessageFactory {
  static botFactory(config, bot, logger) {
    if (config.bot || config.endConversation || config.typing) {
      return BotMessageCreator.factory(config, bot, logger);
    }

    throw new Error(`Unsupported config - ${JSON.stringify(config)}`);
  }
  static userFactory(config, bot, logger) {
    if (config.user) {
      return UserMessageCreator.factory(config, bot, logger)
    }
    throw new Error(`Unsupported config - ${JSON.stringify(config)}`);
  }
}

