import { UserMessage } from '../messages/UserMessage';
import { UniversalBot } from "botbuilder";
import { ScriptObj } from "../helpers";
export declare class UserMessageCreator {
    static factory(config: ScriptObj, bot: UniversalBot, logger: any): UserMessage;
}
