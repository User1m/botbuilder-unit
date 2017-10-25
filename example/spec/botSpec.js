const unit = require('../../botbuilder-unit');
const builder = require('botbuilder');

describe('Simple test for a bot', () => {
  let bot = null;
  beforeEach(() => {
    let connector = new builder.ConsoleConnector().listen();
    bot = new builder.UniversalBot(connector);
    bot.dialog('/', [
      session => builder.Prompts.text(session, 'How should I call you?'),
      (session, args) => builder.Prompts.text(session, `Nice to meet you, ${JSON.stringify(args.response)}!`),
      (session, args) => session.endDialog(`Goodbye------!`)
    ]);
  });
  var ops = {
    timeout: 2000,
  };

  it('Test welcome flow', (done) => {
    let messages = require('./hiScript');
    unit(bot, messages, ops).then(function () {
      done();
    });
  });

  // it('Test welcome flow', (done) => {
  //   let messages = require('./hiScript');
  //   unit(bot, messages, {
  //     LOG_LEVEL: 1
  //   }).then(function () {
  //     done();
  //   })
  // });
});