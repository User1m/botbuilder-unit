const chalk = require('chalk');
const LOG_LEVELS = {
  none: 0,
  info: 1,
  verbose: 2
};

function BotMessage(config, bot, logger) {
  this.config = config;
  this.bot = bot;
  this.logger = logger;
  this.beforeFunc = this.config.before || function () {
    // this.logger("\n", LOG_LEVELS.info);
    return Promise.resolve();
  }
  this.afterFunc = this.config.after || function () {
    this.logger("\n", LOG_LEVELS.info);
    return Promise.resolve();
  };
}
BotMessage.prototype.validate = function (receivedMessage) {
  return new Promise((resolve, reject) => {
    if (receivedMessage.text) {
      this.logger(`BOT ACTUAL: >>`, LOG_LEVELS.info);
      // this.logger(`BOT ACTUAL: >> ${(receivedMessage.text)}`, LOG_LEVELS.info);
    } else {
      this.logger(`BOT ACTUAL: >>`, LOG_LEVELS.info);
      // this.logger(`BOT ACTUAL: >> ${JSON.stringify(receivedMessage)}`, LOG_LEVELS.info);
    }
    this.beforeFunc(this.config, this.bot)
      .then(() => {
        if (this.config.bot) {
          if (typeof this.config.bot === 'function') {
            return this.config.bot(this.bot, receivedMessage);
          } else {
            if (this.config.bot) {
              this.logger(`\nBOT EXPECT: >>\n\n${this.config.bot}`, LOG_LEVELS.info);
              let result = (this.config.bot.test ? this.config.bot.test(receivedMessage.text) : receivedMessage.text === this.config.bot);
              if (!result) {
                var errorMsg = `\n--------------------------------------------------------------------------------------\n `;
                errorMsg += chalk.red("ERROR:\n");
                errorMsg += `\nActual: ${chalk.red(receivedMessage.text)}\n\n`;
                errorMsg += `${chalk.yellow("\t------- did not match -------")}\n\n`;
                errorMsg += `Expected: ${chalk.green(this.config.bot)}\n `;
                throw new Error(errorMsg);
                // reject(error);
              }
            } else {
              reject(chalk.yellow(`
              No input message in: \n${JSON.stringify(this.config)}`));
            }
            return true;
          }
        } else if (this.config.endConversation) {
          this.logger(`
              BOT: >> endConversation `, LOG_LEVELS.info);
          return true;
        } else if (this.config.typing) {
          this.logger(`
              BOT: >> typing `, LOG_LEVELS.info);
          return true;
        } else {
          reject(chalk.yellow(`Unable to find matching validator.Step config: \n${JSON.stringify(this.config)}`));
        }
      })
      .then(() => {
        return this.afterFunc(this.config, this.bot);
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        // console.log("Test Failed Rejecting....");
        reject(err);
      });
  });
};

module.exports = BotMessage;