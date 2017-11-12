"use strict";

export class ConversationMock {
  private steps: Function;
  private currentStep = 0;

  constructor(steps: Function) {
    this.steps = steps;
  }

  public getListener = () => {
    return (session, args, next) => {
      if (this.currentStep > this.steps.length) {
        throw new Error("Out of range for mocked steps");
      }
      let step = this.steps[this.currentStep];
      this.currentStep++;
      step(session, args, next);
    };
  }
}