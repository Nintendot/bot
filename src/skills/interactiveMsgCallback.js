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
          ':ok_hand: once you figure it out, let me know'
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
          bot.replyInteractive(message, 'Thanks! I have saved it.');
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
          bot.replyInteractive(message, ":ok_hand: I won't delete anything");
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
        try {
          const acronym = new Acronym({
            title: message.actions[0].name,
            teamId: bot.team_info.id,
            adapter
          });

          await acronym.delete({
            user: message.user
          });
          bot.replyInteractive(message, `Thanks <@${message.user}>, I deleted your definition of ${message.actions[0].name}`);
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
          ':ok_hand: once you figure it out, let me know'
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
          bot.replyInteractive(message, 'Thanks! I have saved it.');
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
