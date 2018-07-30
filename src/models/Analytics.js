import moment from 'moment';
import entities from 'entities';

export default class Analytics {
  constructor({adapter, message}) {
    this.adapter = adapter;
    this.message = message;
  }

  static decode(value) {
    return entities.decodeHTML(value);
  }

  static normalize(title) {
    return title.replace(/\W/g, '').toUpperCase();
  }

  async save({ action, found, value}) {
    
    try {
      var ts;
      if (this.message.event_time) { // event hearing
        ts = moment.unix(this.message.event_time).format("YYYY-MM-DD hh:mm:ss");
      } else if (this.message.action_ts) { // interactive msg
        ts = moment.unix(this.message.action_ts.split('.')[0]).format("YYYY-MM-DD hh:mm:ss");
      } else {
        ts = '1900-00-00 00:00:00'; // default to a valid ts for db schema
        console.log("Cannot find timestamp in message object, which was: ", this.message);
        console.log("The action was: ", action);
        console.log("The acronym was: ", value);
      }
      
      return this.adapter.save({
        team: this.message.team_id,
        channel: this.message.channel,
        channel_type: this.message.channel_type,
        user: this.message.user,
        method: this.message.type,
        acronym: value || Analytics.decode(this.message.match[1]),
        action,
        found,
        timestamp: ts
      });

    } catch(err) {
      console.error("Analytics error: ", err);
    }
  }
}