'use strict';

import { UserMessage } from '../messages/UserMessage';
import { UniversalBot } from "botbuilder";
import { ScriptObj } from "../helpers";

const consoleConn = 'console';

export class UserMessageCreator {
  static factory(config: ScriptObj, bot: UniversalBot, logger: any) {
    return new UserMessage(config, bot, logger, bot.connector(consoleConn));
  }
}