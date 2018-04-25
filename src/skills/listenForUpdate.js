export default controller => {
  controller.hears(
    [
      /update (?:\W)?([A-Za-z0-9\.]+)(?:\W)? (?:to|with) (?:\W)?(.+?)(?:\W)?$/,
      /replace (?:\W)?([A-Za-z0-9\.]+)(?:\W)? with (?:\W)?(.+?)(?:\W)?$/
    ],
    directly,
    (bot, message) => {
      const teamId = bot.team_info.id;
      const acronym = normaliseAcronym(message.match[1]);
      const expansion = entities.decodeHTML(message.match[2]);

      // if (!acronyms[teamId].hasOwnProperty(acronym)) {
      //   console.log(
      //     `No existing acronym to update. Silently create new acronym '${acronym}'.`
      //   );
      // }
      bot.reply(message, custom_msgs.defineAcronym(acronym, expansion));
      // saveTeamAcronyms(teamId, acronym, expansion, () =>
      //   bot.reply(message, "Thanks for the update!")
      // );
    }
  );
};
