export default controller => {
  controller.hears(
    [/(.*)/],
    ['direct_message', 'mention', 'direct_mention'],
    (bot, message) => {
        var msg = {
            "attachments": [
              {
                "mrkdwn": true,
                "mrkdwn_in": ["text",],
                "fallback": "BAH, somethign went wrong...",
                "title" : "There's an issue!",
                "title_link" : "https://www.google.com/", // use this link to point to the issue
                "text" : "Sorry I'm not available right now. But I will be back baby!"
              }
            ]
          }
        bot.reply(message, msg);
    }
  );
};