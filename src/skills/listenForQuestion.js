import util from 'util';
import Acronym from '../models/Acronym';
import Analytics from '../models/Analytics';

export default analytics_adapter => adapter => controller => {
  controller.hears(
    [
      /what(?:[^\w]|\si)s the meaning of ([\w\.]+)\b/,
      /what(?:[^\w]|\si)s ([\w\.]+)\b/,
      /what does (.+) (?:mean|stand for)\b/
    ],
    ['direct_message', 'mention', 'direct_mention'],
    async (bot, message) => {
      const analytics = new Analytics({
        teamId: bot.team_info.id,
        adapter: analytics_adapter
      });

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
        const formattedMsg = 'Here are the results I found:\n' + msgs.map(m => `_${m.definition}_ by <@${m.creator}>`).join('\n');
        bot.reply(
          message,
          formattedMsg
        );
      } catch (e) {
        bot.reply(message, e.message);

        // analytics
        try {
          console.log(analytics.adapter);
          await analytics.save({
            channel: message.channel,
            user: message.user,
            method: message.type,
            acronym: message.match[1],
            action: 'question',
            found: false
          })
        } catch (e) {
          console.error(`Analytics error:`, e);
        }
      }
    }
  );
};
