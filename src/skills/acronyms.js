import { WebClient } from '@slack/client';

import interactiveMsgCallback from './interactiveMsgCallback';
import listenForActions from './listenForActions';
import listenForAmbient from './listenForAmbient';
import listenForDefination from './listenForDefination';
import listenForDeletion from './listenForDeletion';
import listenForQuestion from './listenForQuestion';
import listenForUpdate from './listenForUpdate';

import localDBAdapter from '../storageAdapters/localDBAdapter';


export default (controller) => {
  const adapter = new localDBAdapter(controller.storage.teams)
  // const web = new WebClient(process.env.slackToken);


  // var stopWords = ["AND", "THE", "IT", "AS", "AN"];

  var listening = new Set();
  controller.storage.channels.all((error, channels) => {
    console.log('init listening');
    for (var channel of channels) if (channel.listen) listening.add(channel.id);
  });

  // const directly = ["direct_message", "mention", "direct_mention"];

  // Listening
  // listenForUpdate(controller);
  // listenForActions(controller);
  // listenForAmbient(controller);
  listenForDefination(controller);
  // listenForDeletion(controller);
  listenForQuestion(adapter)(controller);
  // Interactive msg
  interactiveMsgCallback(adapter)(controller);
};