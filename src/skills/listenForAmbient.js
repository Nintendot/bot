import nlp from 'compromise';
import util from 'util';
import isUndefined from 'lodash/isUndefined';
import Acronym from '../models/Acronym';

export default adapter => controller => {
  controller.on('ambient', async (bot, message) => {
    const nouns = nlp(message.event.text).nouns().out('array');
    const acronymPromises = nouns.map(n => {
      return new Acronym({
        title: n,
        teamId: bot.team_info.id,
        adapter
      });
    }).map(i => i.read(true))
    const result = await Promise.all(acronymPromises);
    const resultWithTitle = result.map((r, index) => ({title: nouns[index], definations: r}))
    const filteredResult = resultWithTitle.filter(t => !isUndefined(t.definations))
    const getUser = util.promisify(bot.api.users.info);
    const sendMsg = async (result) => {
      try {
        const msgs = await Promise.all(
          result.definations.map(async (item) => {
            const { user } = await getUser({user: item.creator});
            return Object.assign({}, item, {creator: user.name});
          })
        );
        const formattedMsg = `*${result.title.toUpperCase()}:*\n` + msgs.map(m => `_${m.defination}_ by <@${m.creator}>`).join('\n');
        bot.reply(
          message,
          formattedMsg
        );
      } catch (e) {
        console.error(e)
      }
    }
    if(filteredResult.length > 0) {
      bot.reply(
        message,
        'Acronym found: \n'
      );
      filteredResult.map(sendMsg)
    }
    
  });
};
