import { runTest } from '../../botbuilder-unit';
import builder = require('botbuilder');
const ops = {
  DEFAULT_TEST_TIMEOUT: 999999,
  LOG_LEVEL: 1
};

describe('Simple test for a bot', () => {
  let bot = null;
  beforeEach(() => {
    let connector = new builder.ConsoleConnector().listen();
    bot = new builder.UniversalBot(connector);
  });

  it('Test welcome flow', (done) => {
    const messages = require('./hiScript');

    bot.dialog('/', [
      session => builder.Prompts.text(session, 'How should I call you?'),
      (session, args) => {
        builder.Prompts.text(session, `Nice to meet you, ${JSON.stringify(args.response)}!`);
      },
      (session, args) => session.endDialog(`Goodbye!`)
    ]);
    runTest(bot, messages, ops)
      .then(function () {
        done();
      });
  });

  it('Test welcome flow 2', (done) => {
    const messages = require('./hiScript.1');

    bot.dialog('/', [
      session => builder.Prompts.text(session, 'How should I call you?'),
      (session, args) => {
        session.send(`Nice to meet you, ${JSON.stringify(args.response)}!`);
        builder.Prompts.text(session, "Ok time to go!");
      },
      (session, args) => session.endDialog(`Goodbye!`)
    ]);
    runTest(bot, messages, ops)
      .then(function () {
        done();
      });
  });

});