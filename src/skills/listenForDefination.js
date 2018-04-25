export default controller => {
  controller.hears(
    [
      /(?:\W)?([A-Za-z0-9\.]+)(?:\W)? (?:means|stands for) (?:\W)?(.+?)(?:\W)?$/
    ],
    directly,
    (bot, message) => {
      const teamId = bot.team_info.id;
      const acronym = normaliseAcronym(message.match[1]);
      const expansion = entities.decodeHTML(message.match[2]);

      if (acronyms[teamId].hasOwnProperty(acronym)) {
        console.log(`Acronym '${acronym}' already defined!`);
        bot.reply(
          message,
          `Sorry! '${acronym}' has already been defined! Feel free to update it, though.`
        );
      } else {
        bot.reply(message, custom_msgs.defineAcronym(acronym, expansion));
      }
    }
  );
};
