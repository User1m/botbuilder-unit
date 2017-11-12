import { ScriptObj } from "../helpers";
import { UniversalBot, IConnector } from "botbuilder";
export declare class UserMessage {
    private scriptObj;
    private beforeFunction;
    private afterFunction;
    private logger;
    private bot;
    private connector;
    constructor(scriptObj: ScriptObj, bot: UniversalBot, logger: any, connector: IConnector);
    send(): Promise<any>;
}
