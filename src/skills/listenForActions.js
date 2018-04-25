export default controller => {
  controller.hears(
    [/(start|stop|are you) listening/],
    ['mention', 'direct_mention'],
    (bot, message) => {
      const request = message.match[1].toLowerCase();
      const channel = message.channel;
      const user = message.user;
      console.log('BCBCBC');
      console.log('channel:' + channel);
      if (request == 'start') {
        console.log(`Start listening on channel ID: ${channel}`);
        listening.add(channel);
        controller.storage.channels.save({ id: channel, listen: true });
        web.users.info(user, (err, info) => {
          bot.reply(message, 'Alright ' + info.user.name + " I'm listening.");
        });
      } else if (request == 'stop') {
        console.log(`Stop listening on channel ID: ${channel}`);
        listening.delete(channel);
        controller.storage.channels.save({ id: channel, listen: false });
        web.users.info(user, (err, info) => {
          bot.reply(
            message,
            'Alright ' + info.user.name + " I'll stop listening."
          );
        });
      } else if (request == 'are you') {
        // console.log(controller.storage.team)
        controller.storage.teams.all((err, allteam_data) => {
          if (err) {
            console.error(err);
          }
          // console.log(allteam_data);
        });
        bot.reply(
          message,
          listening.has(message.channel)
            ? "Yep, I'm listening."
            : "No, I'm not listening."
        );
      } else {
        console.log(`Unknown action '${request}'`);
        bot.reply(message, "Sorry, I don't understand what you mean.");
      }
    }
  );
};
