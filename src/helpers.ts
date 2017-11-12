export enum LOG_LEVELS {
    none,
    info,
    verbose
}

export enum TRIGGER_STATE {
    before = "before",
    after = "after"
}

export enum ACTORS {
    user = "user",
    bot = "bot"
}

export interface ScriptObj {
    bot?: string,
    user?: string,
    test: Function,
    before: Function,
    after: Function;
    endConversation: any;
    typing: any;
}

export interface TestOptions {
    DEFAULT_TEST_TIMEOUT?: number;
    LOG_LEVEL?: LOG_LEVELS;
    FINISH_TIMEOUT?: number;
    NEXT_USER_MESSAGE_TIMEOUT?: number;
}