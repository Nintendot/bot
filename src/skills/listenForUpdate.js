import Acronym from '../models/Acronym';

export default adapter => controller => {
  controller.hears(
    [
      /update (?:\W)?([A-Za-z0-9\.]+)(?:\W)? (?:to|with) (?:\W)?(.+?)(?:\W)?$/,
      /replace (?:\W)?([A-Za-z0-9\.]+)(?:\W)? with (?:\W)?(.+?)(?:\W)?$/
    ],
    ['direct_message', 'mention', 'direct_mention'],
    (bot, message) => {
      const teamId = bot.team_info.id;
      const title = message.match[1].replace(/\W/g, "").toUpperCase();
      const value = message.match[2];
      const user = message.user;
      bot.reply(message, Acronym.getUpdateMsg(user, title, value));
    }
  );
};
