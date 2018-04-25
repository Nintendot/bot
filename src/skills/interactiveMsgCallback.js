export default controller => {
  controller.on('interactive_message_callback', function(bot, message) {
    if (message.callback_id === 'define_acronym') {
      console.log(message.actions);
      if (message.actions[0].value === 'no') {
        bot.replyInteractive(
          message,
          ':ok_hand:, once you figured it out, let me know'
        );
      } else {
        saveTeamAcronyms(
          bot.team_info.id,
          message.actions[0].name,
          message.actions[0].value,
          () => {
            bot.replyInteractive(message, 'Thanks! I have saved it');
          }
        );
      }
    }
    else if (message.callback_id === "remove_acronym") {
      console.log(message.actions);
      if (message.actions[0].value === "no") {
        bot.replyInteractive(message, ":ok_hand:, I won't delete anything");
      } else {
        deleteAcronym(bot.team_info.id, message.actions[0].name, () => {
            bot.replyInteractive(message, "Alright! I have removed it");
        });
      }
    }
  });
};
