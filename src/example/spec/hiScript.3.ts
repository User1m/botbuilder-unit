export =[
  {
    "user": "hi"
  },
  {
    "bot": "How should I call you?"
  },
  {
    "user": "Timmy"
  },
  {
    bot: "Nice to meet you",
    test: (botMessage) => {
      return botMessage.indexOf("Nice to meet you") > -1;
    }
  },
  {
    "user": "See you"
  },
  {
    "bot": "Goodbye!"
  }
];