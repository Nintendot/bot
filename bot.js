/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
const { WebClient } = require('@slack/client');

// An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
const token = process.env.SLACK_TOKEN;

if (!process.env.SLACK_TOKEN) {
  console.error("Missing slack token");
  process.exit(1);
}

const web = new WebClient(process.env.SLACK_TOKEN);

// env(__dirname + '/.env');


if (!process.env.clientId || !process.env.clientSecret || !process.env.PORT) {
  console.log('Error: Specify clientId clientSecret and PORT in environment');
  process.exit(1);
}

var Botkit = require('botkit');
var debug = require('debug')('botkit:main');

var datastoreStorage = require('./storage/datastore')({projectId: 'metrics-195215'});

var bot_options = {
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    // debug: true,
    // users:read and team:read for slack node sdk
    scopes: ['bot', 'users:read', 'team:read']
    // storage: datastoreStorage
};

// Flip the storage option
bot_options.json_file_store = __dirname + '/.data/db/'; // store user data in a simple JSON format

// Create the Botkit controller, which controls all instances of the bot.
var controller = Botkit.slackbot(bot_options);

controller.startTicking();

// controller.storage.teams.get(bot.team_info.id, (error, data) => {
//   if (data !== undefined && data.acronyms !== undefined)
//       acronyms[bot.team_info.id] = data.acronyms;
//   else
//       acronyms[bot.team_info.id] = {};
// });

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + '/components/express_webserver.js')(controller);

// Set up a simple storage backend for keeping a record of customers
// who sign up for the app via the oauth
require(__dirname + '/components/user_registration.js')(controller);

// Send an onboarding message when a new team joins
require(__dirname + '/components/onboarding.js')(controller);

var normalizedPath = require("path").join(__dirname, "skills");
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  require("./skills/" + file)(controller, web);
});


//Note:
// Need 'users:read' for the slack sdk api to get web.users.info
/*
 scopes:
   [ 'identify',
     'bot',
     'channels:history',
     'groups:history',
     'im:history',
     'mpim:history' ],
  acceptedScopes: [ 'users:read', 'team:read' ] }
*/