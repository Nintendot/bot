import util from "util";
import Acronym from "../models/Acronym";
import Analytics from "../models/Analytics";

export default analytics_adapter => adapter => controller => {
  controller.hears(
    [
      /what(?:[^\w]|\si)s the meaning of ([\w\.]+)\b/i,
      /what(?:[^\w]|\si)s ([\w\.]+)\b/i,
      /what does (.+) (?:mean|stand for)\b/i
    ],
    ["direct_message", "mention", "direct_mention"],
    async (bot, message) => {
      bot.reply(
        message,
        `:ok_hand:, give me a second while I look up ${
          message.match[1]
        } :hourglass:`
      );
      const getUser = util.promisify(bot.api.users.info);
      const acronym = new Acronym({
        title: message.match[1],
        teamId: bot.team_info.id,
        adapter
      });
      const analytics = new Analytics({
        adapter: analytics_adapter,
        message
      });
      try {
        const acronymData = await acronym.read();
        const msgs = await Promise.all(
          acronymData.map(async item => {
            let output = {};
            try {
              output = await getUser({ user: item.creator });
            } catch (e) {
              return Object.assign({}, item, {
                creator: "unknown"
              });
            }
            return Object.assign({}, item, { creator: output.user.name });
          })
        );
        const formattedMsg =
          `Here are the results I found on acronym \`${message.match[1].toUpperCase()}\`:\n` +
          msgs
            .map(m => {
              if (m.creator != "unknown") {
                return `\`\`\`${m.definition} by <@${m.creator}>\`\`\``;
              } else {
                return `\`\`\`${m.definition} by a former member\`\`\``;
              }
            })
            .join("\n");
        bot.reply(message, formattedMsg);

        // analytics - found result
        try {
          await analytics.save({
            action: "question",
            found: true
          });
        } catch (e) {
          console.error(`Analytics error:`, e);
        }
      } catch (e) {
        bot.reply(message, e.message);

        // analytics - no result
        try {
          await analytics.save({
            action: "question",
            found: false
          });
        } catch (e) {
          console.error(`Analytics error:`, e);
        }
      }
    }
  );
};
