'use strict';

import { UniversalBot } from "botbuilder";
import { BotMessage } from '../messages/BotMessage';
import { ScriptObj } from "../helpers";

export class BotMessageCreator {
  static factory(scriptObj: ScriptObj, bot: UniversalBot, logger: any) {
    return new BotMessage(scriptObj, bot, logger);
  }
}