import { UniversalBot } from "botbuilder";
import { BotMessage } from '../messages/BotMessage';
import { ScriptObj } from "../helpers";
export declare class BotMessageCreator {
    static factory(scriptObj: ScriptObj, bot: UniversalBot, logger: any): BotMessage;
}
