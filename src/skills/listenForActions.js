import util from 'util';

export default (controller, listening) => {
  controller.hears(
    [/(start|stop|are you) listening/],
    ['mention', 'direct_mention'],
    async (bot, message) => {
      const request = message.match[1].toLowerCase();
      const channel = message.channel;
      const user = message.user;
      try {
          if (request == 'start') {
            console.log(`user ${user} requested to enable listening on channel ID: ${channel}`);
            listening.add(channel);
            controller.storage.channels.save({ id: channel, listen: true });  
            bot.reply(message, `:ok_hand: <@${user}>, I will start to listen in this channel now :ear:`);
          } else if (request == 'stop') {
            console.log(`user ${user} requested to disable listening on channel ID: ${channel}`);
            listening.delete(channel);
            controller.storage.channels.save({ id: channel, listen: false });
              bot.reply(message, `:ok_hand: <@${user}>, I will stop listening in channel :face_with_hand_over_mouth:`);
          } else if (request == 'are you') {
            controller.storage.teams.all((err, allteam_data) => {
              if (err) {
                console.error(err);
              }
            });
            bot.reply(message, listening.has(message.channel)? "Yep, I'm listening." : "No, I'm not listening.");
          } else {
            console.log(`user ${user} requested unknown action '${request}'`);
            bot.reply(message, "Sorry, I don't understand what you mean.");
          }
      } catch (e) {
        bot.reply(message, e.message);
      }
    }
  );
};
