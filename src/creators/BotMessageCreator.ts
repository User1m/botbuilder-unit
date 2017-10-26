'use strict';

import { BotMessage } from '../messages/BotMessage';

export class BotMessageCreator {
  static factory(scriptObj, bot, logger) {
    return new BotMessage(scriptObj, bot, logger);
  }
}