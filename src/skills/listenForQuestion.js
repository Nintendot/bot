export default (controller) => {
  controller.hears(
    [
      /what(?:[^\w]|\si)s the meaning of ([\w\.]+)\b/,
      /what(?:[^\w]|\si)s ([\w\.]+)\b/,
      /what does (.+) (?:mean|stand for)\b/
    ],
    directly,
    (bot, message) => {
      console.log("requesting acronym")
      const teamId = bot.team_info.id;
      const acronym = normaliseAcronym(message.match[1]);
      console.log(`User requested expansion of acronym: '${acronym}'`);

      if (acronyms[teamId].hasOwnProperty(acronym)) {
        bot.reply(
          message,
          `'${acronym}' stands for '${acronyms[teamId][acronym]}'`
        );
      } else {
        console.log(`Acronym '${acronym}' not found.`);
        bot.reply(
          message,
          `Nothing has been defined for '${acronym}' yet :disappointed:`
        );
      }
    }
  );
}