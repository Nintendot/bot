import Acronym from '../models/Acronym';
import Analytics from '../models/Analytics';

export default analytics_adapter => controller => {
  controller.hears(
    [
      /(?:\W)?([A-Za-z0-9\.]+)(?:\W)? (?:means|stands for) (?:\W)?(.+?)(?:\W)?$/
    ],
    ['direct_message', 'mention', 'direct_mention'],
    async (bot, message) => {
      const title = message.match[1];
      const value = message.match[2];
      const user = message.user;
      bot.reply(message, Acronym.getDefineMsg(user, title, value));
      const analytics = new Analytics({
        adapter: analytics_adapter,
        message
      });
      try {
        await analytics.save({
          action: 'define_trigger',
          found: null
        })
      } catch (e) {
        console.error(`Analytics error:`, e);
      }
    }
  );
};
