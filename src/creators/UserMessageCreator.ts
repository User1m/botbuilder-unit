'use strict';

import { UserMessage } from '../messages/UserMessage';

export class UserMessageCreator {
  static factory(config, bot, logger) {
    return new UserMessage(config, bot, logger, bot.connector('console'));
  }
}