import interactiveMsgCallback from './interactiveMsgCallback';
import listenForActions from './listenForActions';
import listenForAmbient from './listenForAmbient';
import listenForDefination from './listenForDefination';
import listenForDeletion from './listenForDeletion';
import listenForQuestion from './listenForQuestion';
import listenForUpdate from './listenForUpdate';


export default (controller) => {

  const { WebClient } = require('@slack/client');
  const entities = require("entities");
  const web = new WebClient(process.env.slackToken);

  var acronyms = {};
  var stopWords = ["AND", "THE", "IT", "AS", "AN"];

  var listening = new Set();
  controller.storage.channels.all((error, channels) => {
    console.log('init listening');
    for (var channel of channels) if (channel.listen) listening.add(channel.id);
  });

  const directly = ["direct_message", "mention", "direct_mention"];

  // Listening
  listenForActions(controller);
  listenForAmbient(controller);
  listenForDefination(controller);
  listenForDeletion(controller);
  listenForQuestion(controller);
  listenForUpdate(controller);
  // Interactive msg
  interactiveMsgCallback(controller);
};