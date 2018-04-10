module.exports = function(controller, web) {
  const entities = require("entities");
  const custom_msgs = require("../custom_msgs/acronyms");

  var acronyms = {};
  var stopWords = ["AND", "THE", "IT", "AS", "AN"];

  // Init Acronym data
  // TODO: could there be race conditions?
  web.team.info((err, info) => {
    console.log("init acronym");
    var teamId = info.team.id;

    controller.storage.teams.get(teamId, (error, teams) => {
      if (teams && teams.acronyms) {
        acronyms[teamId] = teams.acronyms;
      }
      else {
        acronyms[teamId] = {};
      }
    });
  });

  // Init listening data

  var listening = new Set();
  controller.storage.channels.all((error, channels) => {
    console.log('init listening');
    console.log(channels);
    for (var channel of channels) if (channel.listen) listening.add(channel.id);
  });

  function normaliseAcronym(acronym) {
    return acronym.replace(/\W/g, "").toUpperCase();
  }

  function saveTeamAcronyms(teamId, acronym, expansion, callback) {
    controller.storage.teams.get(teamId, (error, data) => {
      acronyms[teamId][acronym] = expansion;
      data.acronyms = acronyms[teamId];
      // For botkit storage lookup
      data.id = teamId;
      callback = callback || (error => console.error(error));
      controller.storage.teams.save(data, callback);
    });
  }

  function deleteAcronym(teamId, acronym, callback) {
    controller.storage.teams.get(teamId, (error, data) => {
      delete acronyms[teamId][acronym];
      data.acronyms = acronyms[teamId];
      callback = callback || (error => console.error(error));
      controller.storage.teams.save(data, callback);
    });
  }


  const directly = ["direct_message", "mention", "direct_mention"];

  controller.hears(
    [
      /(?:\W)?([A-Za-z0-9\.]+)(?:\W)? (?:means|stands for) (?:\W)?(.+?)(?:\W)?$/
    ],
    directly,
    (bot, message) => {
      const teamId = bot.team_info.id;
      const acronym = normaliseAcronym(message.match[1]);
      const expansion = entities.decodeHTML(message.match[2]);

      if (acronyms[teamId].hasOwnProperty(acronym)) {
        console.log(`Acronym '${acronym}' already defined!`);
        bot.reply(
          message,
          `Sorry! '${acronym}' has already been defined! Feel free to update it, though.`
        );
      } else {
        
        bot.reply(message, custom_msgs.defineAcronym(acronym, expansion));
        
      }
    }
  );

  controller.hears(
    [/(?:remove|delete) (?:\W)?(.+?)(?:\W)?$/],
    directly,
    (bot, message) => {
      const teamId = bot.team_info.id;
      const acronym = normaliseAcronym(message.match[1]);
      console.log(`User requested deletion of acronym: '${acronym}'`);

      if (acronyms[teamId].hasOwnProperty(acronym)) {
        expansion = acronyms[teamId][acronym];
        bot.reply(message, custom_msgs.deleteAcronym(acronym, expansion));      

      } else {
        console.log(`Unable to delete '${acronym}'. Acronym not found.`);
        bot.reply(message, "Sorry, I don't know that acronym.");
      }
    }
  );

  controller.hears(
    [
      /update (?:\W)?([A-Za-z0-9\.]+)(?:\W)? (?:to|with) (?:\W)?(.+?)(?:\W)?$/,
      /replace (?:\W)?([A-Za-z0-9\.]+)(?:\W)? with (?:\W)?(.+?)(?:\W)?$/
    ],
    directly,
    (bot, message) => {
      const teamId = bot.team_info.id;
      const acronym = normaliseAcronym(message.match[1]);
      const expansion = entities.decodeHTML(message.match[2]);

      // if (!acronyms[teamId].hasOwnProperty(acronym)) {
      //   console.log(
      //     `No existing acronym to update. Silently create new acronym '${acronym}'.`
      //   );
      // }
      bot.reply(message, custom_msgs.defineAcronym(acronym, expansion));      
      // saveTeamAcronyms(teamId, acronym, expansion, () =>
      //   bot.reply(message, "Thanks for the update!")
      // );
    }
  );

  controller.hears(
    [
      /what(?:[^\w]|\si)s the meaning of ([\w\.]+)\b/,
      /what(?:[^\w]|\si)s ([\w\.]+)\b/,
      /what does (.+) (?:mean|stand for)\b/
    ],
    directly,
    (bot, message) => {
      const teamId = bot.team_info.id;
      const acronym = normaliseAcronym(message.match[1]);
      console.log(`User requested expansion of acronym: '${acronym}'`);

      if (acronyms[teamId].hasOwnProperty(acronym)) {
        bot.reply(
          message,
          `'${acronym}' stands for '${acronyms[teamId][acronym]}'`
        );
      } else {
        console.log(`Acronym '${acronym}' not found.`);
        bot.reply(
          message,
          `Nothing has been defined for '${acronym}' yet :disappointed:`
        );
      }
    }
  );

  controller.on("ambient", (bot, message) => {
    if (listening.has(message.channel)) {
      const teamId = bot.team_info.id;
      const tokenised = message.text
        .replace(/['",\.;:\?\(\)]/g, "")
        .split(/\s/);
      const matched = tokenised.filter(
        part =>
          part.match(/^[A-Z]{2,}$/) &&
          acronyms[teamId].hasOwnProperty(part) &&
          !stopWords.includes(part)
      );

      if (matched.length > 0) {
        controller.storage.users.get(message.user, (error, data) => {
          if (error) {
            const maybePlural = matched.length > 1 ? "s" : "";
            bot.reply(
              message,
              `Acronym${maybePlural} detected!` +
                matched.map(
                  acronym =>
                    `\n'${acronym}' means '${acronyms[teamId][acronym]}'.`
                )
            );
          } else {
            var response = message.text;
            matched.forEach(acronym => {
              response = response.replace(
                acronym,
                acronym + ` (${acronyms[teamId][acronym]})`
              );
            });

            bot.api.chat.update({
              token: data.access_token,
              ts: message.ts,
              channel: message.channel,
              text: response,
              as_user: true
            });
          }
        });
      }
    }
  });

  // Listening

  controller.hears(
    [/(start|stop|are you) listening/],
    ["mention", "direct_mention"],
    (bot, message) => {
      const request = message.match[1].toLowerCase();
      const channel = message.channel;
      const user = message.user;

      if (request == "start") {
        console.log(`Start listening on channel ID: ${channel}`);
        listening.add(channel);
        controller.storage.channels.save({ id: channel, listen: true });
        web.users.info(user, (err, info) => {
          bot.reply(message, "Alright " + info.user.name + " I'm listening.");
        });
      } else if (request == "stop") {
        console.log(`Stop listening on channel ID: ${channel}`);
        listening.delete(channel);
        controller.storage.channels.save({ id: channel, listen: false });
        web.users.info(user, (err, info) => {
          bot.reply(
            message,
            "Alright " + info.user.name + " I'll stop listening."
          );
        });
      } else if (request == "are you") {
        controller.storage.team.all((err, allteam_data) => {
          if (err) {
            console.error(err);
          }

          console.log(allteam_data);

        });
        bot.reply(
          message,
          listening.has(message.channel)
            ? "Yep, I'm listening."
            : "No, I'm not listening."
        );
      } else {
        console.log(`Unknown action '${request}'`);
        bot.reply(message, "Sorry, I don't understand what you mean.");
      }
    }
  );

  // Interactive msg

  controller.on("interactive_message_callback", function(bot, message) {
    if (message.callback_id === "define_acronym") {
      console.log(message.actions);
      if (message.actions[0].value === "no") {
        bot.replyInteractive(message, ":ok_hand:, once you figured it out, let me know");
      } else {
        saveTeamAcronyms(bot.team_info.id, message.actions[0].name, message.actions[0].value, () => {
            bot.replyInteractive(message, "Thanks! I have saved it");
        });

      }
    }
  });

  controller.on("interactive_message_callback", function(bot, message) {
    if (message.callback_id === "remove_acronym") {
      console.log(message.actions);
      if (message.actions[0].value === "no") {
        bot.replyInteractive(message, ":ok_hand:, I won't delete anything");
      } else {
        deleteAcronym(bot.team_info.id, message.actions[0].name, () => {
            bot.replyInteractive(message, "Alright! I have removed it");
        });
      }
    }
  });
};
