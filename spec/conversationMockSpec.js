const botFactory = require('./botFactory');
const unit = require('../');
describe('Test Suite for Conversation Mock class', function () {
  it('Test Conversation Mock in simple dialog', ( done ) =>{
    let bot = botFactory();
    let mock = new unit.ConversationMock([
      (session, args, next) => {
        console.trace();
        console.log('[[arguments]]')
        console.log(arguments)
        session.send('Hello!');
        next()
      },
      (session, args, next) => {
        session.send('Second call');
        next()
      },
      (session, args, next) => {
        session.endConversation('Third call');

      },
      (session, args, next) => {
        session.send('Forth call');
        next()
      },
      (session, args, next) => {
        session.send('Fifth call');
        next()
      },
      (session, args, next) => {
        session.send('Sixth call');
        session.endConversation();
      }
    ]);

    bot.dialog('/test',[
      mock.getListener(),
      mock.getListener(),
      mock.getListener()
    ]);
    let script = [
      {user : 'Hi'},
      {bot : 'Hello!'},
      {bot:'Second call'},
      {bot:'Third call'},
      {endConversation:true},
      {user:'Hi!'},
      {bot:'Forth call'},
      {bot:'Fifth call'},
      {bot:'Sixth call'},
      {endConversation:true}
    ];
    unit(bot,script).then( function () {
      done();
    }, function (error) {
      fail('Error during testing ConversationMock:' + error.toString());
      done();
    })
  });

})