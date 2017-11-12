export declare class ConversationMock {
    private steps;
    private currentStep;
    constructor(steps: Function);
    getListener: () => (session: any, args: any, next: any) => void;
}
