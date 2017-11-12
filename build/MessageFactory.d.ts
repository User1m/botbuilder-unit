import { BotMessage } from "./messages/BotMessage";
import { UserMessage } from "./messages/UserMessage";
export declare class MessageFactory {
    static bot(scriptMsg: any, bot: any, logger: any): BotMessage;
    static user(scriptMsg: any, bot: any, logger: any): UserMessage;
}
