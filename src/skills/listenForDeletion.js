export default (controller) => {
  controller.hears(
    [/(?:remove|delete) (?:\W)?(.+?)(?:\W)?$/],
    directly,
    (bot, message) => {
      const teamId = bot.team_info.id;
      const acronym = normaliseAcronym(message.match[1]);
      console.log(`User requested deletion of acronym: '${acronym}'`);

      if (acronyms[teamId].hasOwnProperty(acronym)) {
        expansion = acronyms[teamId][acronym];
        bot.reply(message, custom_msgs.deleteAcronym(acronym, expansion));      

      } else {
        console.log(`Unable to delete '${acronym}'. Acronym not found.`);
        bot.reply(message, "Sorry, I don't know that acronym.");
      }
    }
  );
}