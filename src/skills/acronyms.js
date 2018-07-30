import { WebClient } from '@slack/client';

import interactiveMsgCallback from './interactiveMsgCallback';
import listenForActions from './listenForActions';
import listenForAmbient from './listenForAmbient';
import listenForDefinition from './listenForDefinition';
import listenForDeletion from './listenForDeletion';
import listenForQuestion from './listenForQuestion';
import listenForUpdate from './listenForUpdate';
import listenForSlash from './listenForSlash';

//import Bigquery from '../analyticsAdapters/BigQuery';
import localAnalytics from '../analyticsAdapters/localAnalytics';
// import localDBAdapter from '../storageAdapters/localDBAdapter';
import bigQueryAdapter from '../storageAdapters/bigQueryAdapter';

export default (controller) => {
  const adapter = new bigQueryAdapter(controller.storage.teams)
  // const adapter = new localDBAdapter(controller.storage.teams)
  const analytics_adapter = new localAnalytics();
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
  // Listening - Slash Command
  listenForSlash(controller);
  // Interactive msg
  interactiveMsgCallback(analytics_adapter)(adapter)(controller);
};