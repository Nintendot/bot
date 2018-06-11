import Acronym from '../models/Acronym';

export default controller => {
  controller.hears(
    [
      /(?:\W)?([A-Za-z0-9\.]+)(?:\W)? (?:means|stands for) (?:\W)?(.+?)(?:\W)?$/
    ],
    ['direct_message', 'mention', 'direct_mention'],
    (bot, message) => {
      const title = message.match[1];
      const value = message.match[2];
      const user = message.user;
      bot.reply(message, Acronym.getDefineMsg(user, title, value));
    }
  );
};
