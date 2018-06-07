import { WebClient } from '@slack/client';

import interactiveMsgCallback from './interactiveMsgCallback';
import listenForActions from './listenForActions';
import listenForAmbient from './listenForAmbient';
import listenForDefinition from './listenForDefinition';
import listenForDeletion from './listenForDeletion';
import listenForQuestion from './listenForQuestion';
import listenForUpdate from './listenForUpdate';

import localDBAdapter from '../storageAdapters/localDBAdapter';

export default (controller) => {
  const adapter = new localDBAdapter(controller.storage.teams)
  // const web = new WebClient(process.env.slackToken);

  var listening = new Set();
  controller.storage.channels.all((error, channels) => {
    console.log('init listening');
    for (var channel of channels) if (channel.listen) listening.add(channel.id);
  });


  // Listening
  // listenForUpdate(controller);
  listenForActions(controller, listening);
  listenForAmbient(adapter)(controller);
  listenForDefinition(controller);
  listenForDeletion(adapter)(controller);
  listenForQuestion(adapter)(controller);
  // Interactive msg
  interactiveMsgCallback(adapter)(controller);
};