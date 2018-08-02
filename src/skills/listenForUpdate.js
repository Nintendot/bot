import Acronym from '../models/Acronym';
import Analytics from '../models/Analytics';

export default analytics_adapter => controller => {
  controller.hears(
    [
      /update (?:\W)?([A-Za-z0-9\.]+)(?:\W)? (?:to|with) (.+)$/,
      /replace (?:\W)?([A-Za-z0-9\.]+)(?:\W)? with (.+)$/
    ],
    ['direct_message', 'mention', 'direct_mention'],
    async (bot, message) => {
      const teamId = bot.team_info.id;
      const title = message.match[1].replace(/\W/g, "").toUpperCase();
      const value = message.match[2];
      const user = message.user;
      bot.reply(message, Acronym.getUpdateMsg(user, title, value));
      const analytics = new Analytics({
        adapter: analytics_adapter,
        message
      });
      try {
        await analytics.save({
          action: 'update_trigger',
          found: null
        })
      } catch (e) {
        console.error(`Analytics error:`, e);
      }
    }
  );
};
