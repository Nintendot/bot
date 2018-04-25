export default controller => {
  controller.on('ambient', (bot, message) => {
    if (listening.has(message.channel)) {
      const teamId = bot.team_info.id;
      const tokenised = message.text
        .replace(/['",\.;:\?\(\)]/g, '')
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
            const maybePlural = matched.length > 1 ? 's' : '';
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
};
