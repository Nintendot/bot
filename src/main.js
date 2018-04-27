import acronyms from './skills/acronyms';
const path = require('path')
const env = require('node-env-file')
env(path.join(__dirname, '../' , '.env'))


var Botkit = require('botkit');
var debug = require('debug')('botkit:main');

var bot_options = {
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    // debug: true,
    // users:read and team:read for slack node sdk
    scopes: ['bot', 'team:read']
    // storage: datastoreStorage
};

// Flip the storage option
bot_options.json_file_store = __dirname + '/../.data/db/'; // store user data in a simple JSON format

// Create the Botkit controller, which controls all instances of the bot.
var controller = Botkit.slackbot(bot_options);

controller.startTicking();

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + '/components/express_webserver.js')(controller);

// Set up a simple storage backend for keeping a record of customers
// who sign up for the app via the oauth
require(__dirname + '/components/user_registration.js')(controller);

// Send an onboarding message when a new team joins
require(__dirname + '/components/onboarding.js')(controller);
acronyms(controller)
// require(__dirname + '/skills/acronyms.js')(controller);
// var normalizedPath = require("path").join(__dirname, "skills");
// require("fs").readdirSync(normalizedPath).forEach(function(file) {
//   require("./skills/acronyms")(controller);
// });