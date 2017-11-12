import { ScriptObj } from "../helpers";
import { UniversalBot } from "botbuilder";
export declare class BotMessage {
    private scriptObj;
    private beforeFunction;
    private afterFunction;
    private logger;
    private bot;
    constructor(scriptObj: ScriptObj, bot: UniversalBot, logger: any);
    private printErrorMsg(actual, expected);
    validate(botMessage: any): Promise<{}>;
}
