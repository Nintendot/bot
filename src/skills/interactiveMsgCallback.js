import Acronym from '../models/Acronym';
import Analytics from '../models/Analytics';

export default analytics_adapter => adapter => controller => {
  
  controller.on('interactive_message_callback', async (bot, message) => {
    const analytics = new Analytics({
      adapter: analytics_adapter,
      message
    });

    if (message.callback_id === 'define_acronym') {
      if (message.actions[0].value === 'no') {
        bot.replyInteractive(
          message,
          `:ok_hand: no worries <@${message.user}>, once you figure it out, please let me know :spock-hand:`
        );
        try {
          await analytics.save({
            action: 'define_cancel',
            found: null,
            value: message.actions[0].name
          })
        } catch (e) {
          console.error(`Analytics error:`, e);
        }
      } else {
        // Prompt a message first to prevent spamming the interactive button
        bot.replyInteractive(message, `:ok_hand:, give me a second while I try to save it :floppy_disk:`);
        const acronym = new Acronym({
          title: message.actions[0].name,
          teamId: bot.team_info.id,
          adapter
        });
        try {
          await acronym.save({
            value: message.actions[0].value,
            user: message.user,
            overwrite: false
          });
          bot.replyInteractive(message, `:heart: Thanks <@${message.user}>, I saved your definition of ${message.actions[0].name} :raised_hands:`);
          try {
            await analytics.save({
              action: 'define_confirm',
              found: null,
              value: message.actions[0].name
            })
          } catch (e) {
            console.error(`Analytics error:`, e);
          }
        } catch(e) {
          bot.replyInteractive(message, e.message);
        }
      }
    }
    else if (message.callback_id === "remove_acronym") {

      if (message.actions[0].value === "no") {
          bot.replyInteractive(message, `:ok_hand: <@${message.user}> I won't delete anything :relaxed:`);
          try {
          await analytics.save({
            action: 'remove_cancel',
            found: null,
            value: message.actions[0].name
          })
        } catch (e) {
          console.error(`Analytics error:`, e);
        }
      } else if (message.actions[0].value === "yes") {
        // Prompt a message first to prevent spamming the interactive button
        bot.replyInteractive(message, `:ok_hand:, give me a second while I work on it :crossed_fingers:`);
        try {
          const acronym = new Acronym({
            title: message.actions[0].name,
            teamId: bot.team_info.id,
            adapter
          });

          await acronym.delete({
            user: message.user
          });
          bot.replyInteractive(message, `:+1: Thanks <@${message.user}>, I deleted your definition of ${message.actions[0].name} :v:`);
          try {
            await analytics.save({
              action: 'remove_confirm',
              found: null,
              value: message.actions[0].name
            })
          } catch (e) {
            console.error(`Analytics error:`, e);
          }
        } catch(e) {
          bot.replyInteractive(message, e.message);
        }
      }
    }
    else if (message.callback_id === 'update_acronym') {
      if (message.actions[0].value === 'no') {
        bot.replyInteractive(
          message,
          `:ok_hand: no worries <@${message.user}>, once you figure it out, please let me know :the_horns:`
        );
        try {
          await analytics.save({
            action: 'update_cancel',
            found: null,
            value: message.actions[0].name
          })
        } catch (e) {
          console.error(`Analytics error:`, e);
        }
      } else {
        bot.replyInteractive(message, `:ok_hand:, give me a second while I try to update it :construction:`);
        const acronym = new Acronym({
          title: message.actions[0].name,
          teamId: bot.team_info.id,
          adapter
        });
        try {
          await acronym.save({
            value: message.actions[0].value,
            user: message.user,
            overwrite: true
          });
          bot.replyInteractive(message, `:i_love_you_hand_sign: Thanks <@${message.user}>, I updated your definition of ${message.actions[0].name} :v:`);
          try {
            await analytics.save({
              action: 'update_confirm',
              found: null,
              value: message.actions[0].name
            })
          } catch (e) {
            console.error(`Analytics error:`, e);
          }
        } catch(e) {
          bot.replyInteractive(message, e.message);
        }
      }
    }
  });
};
