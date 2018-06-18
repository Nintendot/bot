import { WebClient } from '@slack/client';

import interactiveMsgCallback from './interactiveMsgCallback';
import listenForActions from './listenForActions';
import listenForAmbient from './listenForAmbient';
import listenForDefinition from './listenForDefinition';
import listenForDeletion from './listenForDeletion';
import listenForQuestion from './listenForQuestion';
import listenForUpdate from './listenForUpdate';

import Bigquery from '../analyticsAdapters/BigQuery';
import localDBAdapter from '../storageAdapters/localDBAdapter';

export default (controller) => {
  const adapter = new localDBAdapter(controller.storage.teams)
  const analytics_adapter = new Bigquery();
  // const web = new WebClient(process.env.slackToken);

  var listening = new Set();
  controller.storage.channels.all((error, channels) => {
    console.log('init listening');
    for (var channel of channels) if (channel.listen) listening.add(channel.id);
  });


  // Listening
  listenForUpdate(analytics_adapter)(controller);
  listenForActions(controller, listening);
  listenForAmbient(analytics_adapter)(adapter)(controller);
  listenForDefinition(analytics_adapter)(controller);
  listenForDeletion(analytics_adapter)(controller);
  listenForQuestion(analytics_adapter)(adapter)(controller);
  // Interactive msg
  interactiveMsgCallback(analytics_adapter)(adapter)(controller);
};