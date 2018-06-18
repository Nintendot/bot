import nlp from 'compromise';
import util from 'util';
import isUndefined from 'lodash/isUndefined';
import Acronym from '../models/Acronym';
import Analytics from '../models/Analytics';

export default analytics_adapter => adapter => controller => {
  controller.on('ambient', async (bot, message) => {
    const analytics = new Analytics({
      adapter: analytics_adapter,
      message
    });
    const channel = message.channel;
    const user = message.user;
    controller.storage.channels.get(channel, async (err, channel_data) => {
      if (err) {
        console.log('error getting channel info:', err);
      }
      if (channel_data) {
        if (channel_data.listen) {
          // console.log(`Listening in channel - id: ${channel}>`);
          const nouns = nlp(message.event.text).nouns().out('array');
          const acronymPromises = nouns.map(n => {
            return new Acronym({
              title: n,
              teamId: bot.team_info.id,
              adapter
            });
          }).map(i => i.read(true));
          const result = await Promise.all(acronymPromises);
          const resultWithTitle = result.map((r, index) => ({title: nouns[index], definitions: r}));
          const filteredResult = resultWithTitle.filter(t => !isUndefined(t.definitions));
          const getUser = util.promisify(bot.api.users.info);
          const sendMsg = async (result) => {
            try {
              const msgs = await Promise.all(
                result.definitions.map(async (item) => {
                  const { user } = await getUser({user: item.creator});
                  return Object.assign({}, item, {creator: user.name});
                })
              );
              const formattedMsg = `*${result.title.toUpperCase()}:*\n` + msgs.map(m => `_${m.definition}_ by <@${m.creator}>`).join('\n');
              bot.reply(
                message,
                formattedMsg
              );
            } catch (e) {
              console.error(e);
            }
          }
          if (filteredResult.length > 0) {
            bot.reply(
              message,
              'Acronym found: \n'
            );
            filteredResult.map(sendMsg);
          }
        } else {
          // console.log(`Not listening in <#${message.channel}>`);
        }
      }
    });
  });
};
