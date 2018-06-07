import Acronym from '../models/Acronym';

export default adapter => controller => {
  controller.on('interactive_message_callback', async (bot, message) => {
    if (message.callback_id === 'define_acronym') {
      if (message.actions[0].value === 'no') {
        bot.replyInteractive(
          message,
          ':ok_hand:, once you figured it out, let me know'
        );
      } else {
        const acronym = new Acronym({
          title: message.actions[0].name,
          teamId: bot.team_info.id,
          adapter
        });
        try {
          await acronym.save({
            value: message.actions[0].value,
            user: message.user
          });
          bot.replyInteractive(message, 'Thanks! I have saved it.');
        } catch(e) {
          bot.replyInteractive(message, e.message);
        }
      }
    }
    else if (message.callback_id === "remove_acronym") {

      if (message.actions[0].value === "no") {
          bot.replyInteractive(message, ":ok_hand:, I won't delete anything");
      } else if (message.actions[0].value === "yes") {
        try {
          
          const acronym = new Acronym({
            title: message.actions[0].name,
            teamId: bot.team_info.id,
            adapter
          });

          await acronym.delete({
            user: message.user
          });
          bot.replyInteractive(message, `Thanks <@${message.user}>, I deleted your definition of ${message.actions[0].name}`);
        } catch(e) {
          bot.replyInteractive(message, e.message);
        }
      }
    }
  });
};
