'use strict';

import { BotMessage } from '../messages/BotMessage';

export class BotMessageCreator {
  static factory(config, bot, logger) {
    return new BotMessage(config, bot, logger);
  }
}