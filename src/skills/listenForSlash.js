import Analytics from '../models/Analytics';

export default controller => {
  controller.on("slash_command", async (bot, message) => {
    const BOTCRONYM_CMD = "/botcronym";
    const BOTCRONYM_HELP = "help";

    switch (message.command) {
      case BOTCRONYM_CMD:
        if (message.text === "" || message.text === BOTCRONYM_HELP) {

            var refinedMsg = {
                "attachments": [
                  {
                    "mrkdwn": true,
                    "mrkdwn_in": ["text",],
                    "fallback": "BAH, somethign went wrong...",
                    "title" : "Improve our communication by explaining acronyms",
                    "title_link" : "http://orangesquare.com/no-more-acronyms/",
                    "text" : "*Syntax: (In a channel)*" + "\n" +
                    "`Ask a question:`" + "\n" +
                    "```@Botcronym what is <ABC>?" + "\n" +
                    "or" + "\n" +
                    "@Botcronym what does <ABC> mean/stand for?`" + "\n" + 
                    "or" + "\n" +
                    "@Botcronym what is the meaning of <ABC>?```" + "\n" +
                    "`Define an acronym:`" + "\n" +
                    "```@Botcronym <ABC> means <meaning>" + "\n" +
                    "or" + "\n" +
                    "@Botcronym <ABC> stands for <meaning>```" + "\n" + "\n" +
                    "`Update an acronym:`" + "\n" +
                    "```@Botcronym update <ABC> to <meaning>`" + "\n" +
                    "or" + "\n" +
                    "@Botcronym replace <ABC> with <meaning>```" + "\n" + "\n" +
                    "`Delete an acronym:`" + "\n" + 
                    "```@Botcronym remove <ABC>`" + "\n" +
                    "or" + "\n" + 
                    "@Botcronym delete <ABC>```" + "\n" + "\n" +
                    "`Enable / disable / check channel ambient notification`" + "\n" +
                    "```When enabled, @Botcronym will listen to the messages in the channel and try to notify that a defined acronym is mentioned" + "\n" + "\n" +
                    "Enable: " + "\n" +
                    "@Botcronym start listening" + "\n" +
                    "Enable: " + "\n" +
                    "@Botcronym stop listening" + "\n" +
                    "Check: " + "\n" +
                    "@Botcronym are you listening?```" + "\n" +
                    "*Syntax: (direct message)*" + "\n" +
                    "```To ask questions, define / update / delete acronyms:" + "\n" +
                    "The same syntax as channel applies , with no need to mention @Botcronym" + "\n" +
                    "e.g: when chatting with @Botcronym, simply ask: 'What is <ABC>'" + "\n" +
                    "Ambient notification is not applicable in direct message```"
                  }
                ]
              }

            bot.replyPrivate(message, refinedMsg);
        } else {
            bot.replyPrivate(
            message,
            `:flushed: I don't how to \`${message.text}\` yet :flushed:`
          );
        }
        break;
    }
  });
};
