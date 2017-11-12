"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConversationMock {
    constructor(steps) {
        this.currentStep = 0;
        this.getListener = () => {
            return (session, args, next) => {
                if (this.currentStep > this.steps.length) {
                    throw new Error("Out of range for mocked steps");
                }
                let step = this.steps[this.currentStep];
                this.currentStep++;
                step(session, args, next);
            };
        };
        this.steps = steps;
    }
}
exports.ConversationMock = ConversationMock;
//# sourceMappingURL=ConversationMock.js.map