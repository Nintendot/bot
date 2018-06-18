import Acronym from '../models/Acronym';
import Analytics from '../models/Analytics';

export default analytics_adapter => controller => {
  controller.hears(
    [/(?:remove|delete) (?:\W)?(.+?)(?:\W)?$/],
    ['direct_message', 'mention', 'direct_mention'],
    async (bot, message) => {
      const teamId = bot.team_info.id;
      const title = message.match[1].replace(/\W/g, "").toUpperCase();
      const user = message.user;

      bot.reply(message, Acronym.getDeleteMsg(user, title));
      const analytics = new Analytics({
        adapter: analytics_adapter,
        message
      });
      try {
        await analytics.save({
          action: 'delete_trigger',
          found: null
        })
      } catch (e) {
        console.error(`Analytics error:`, e);
      }
    }
  );
}