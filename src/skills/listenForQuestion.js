import util from 'util';
import Acronym from '../models/Acronym';

export default adapter => controller => {
  controller.hears(
    [
      /what(?:[^\w]|\si)s the meaning of ([\w\.]+)\b/,
      /what(?:[^\w]|\si)s ([\w\.]+)\b/,
      /what does (.+) (?:mean|stand for)\b/
    ],
    ['direct_message', 'mention', 'direct_mention'],
    async (bot, message) => {
      const getUser = util.promisify(bot.api.users.info);
      const acronym = new Acronym({
        title: message.match[1],
        teamId: bot.team_info.id,
        adapter
      });
      try {
        const acronymData = await acronym.read();
        const msgs = await Promise.all(
            acronymData.map(async (item) => {
            const { user } = await getUser({user: item.creator});
            return Object.assign({}, item, {creator: user.name});
          })
        );
        const formattedMsg = 'Here are the results I found:\n' + msgs.map(m => `*${m.defination}* by <@${m.creator}>`).join('\n');
        bot.reply(
          message,
          formattedMsg
        );
      } catch (e) {
        bot.reply(message, e.message);
      }

      // console.log(acronymData)

      // console.log("requesting acronym")
      // const teamId = bot.team_info.id;
      // const acronym = normaliseAcronym(message.match[1]);
      // console.log(`User requested expansion of acronym: '${acronym}'`);

      // if (acronyms[teamId].hasOwnProperty(acronym)) {
      //   bot.reply(
      //     message,
      //     `'${acronym}' stands for '${acronyms[teamId][acronym]}'`
      //   );
      // } else {
      //   console.log(`Acronym '${acronym}' not found.`);
      //   bot.reply(
      //     message,
      //     `Nothing has been defined for '${acronym}' yet :disappointed:`
      //   );
      // }
    }
  );
};
