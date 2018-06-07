import Acronym from '../models/Acronym';

export default adapter => controller => {
  controller.hears(
    [/(?:remove|delete) (?:\W)?(.+?)(?:\W)?$/],
    ['direct_message', 'mention', 'direct_mention'],
    async (bot, message) => {
      const teamId = bot.team_info.id;
      const title = message.match[1].replace(/\W/g, "").toUpperCase();
      const user = message.user;

      console.log(`User ${message.user} requested deletion of acronym: '${title}'`);
      bot.reply(message, Acronym.getDeleteMsg(user, title));
    }
  );
}