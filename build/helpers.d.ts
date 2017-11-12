export declare enum LOG_LEVELS {
    none = 0,
    info = 1,
    verbose = 2,
}
export declare enum TRIGGER_STATE {
    before = "before",
    after = "after",
}
export declare enum ACTORS {
    user = "user",
    bot = "bot",
}
export interface ScriptObj {
    bot?: string | BotOptions;
    user?: string;
    before: Function;
    after: Function;
    endConversation: any;
    typing: any;
}
export interface BotOptions {
    test: Function;
    text: string;
}
export interface TestOptions {
    DEFAULT_TEST_TIMEOUT?: number;
    LOG_LEVEL?: LOG_LEVELS;
    FINISH_TIMEOUT?: number;
    NEXT_USER_MESSAGE_TIMEOUT?: number;
}
