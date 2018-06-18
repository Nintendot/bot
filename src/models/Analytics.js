import moment from 'moment';
import entities from 'entities';

const timestamp = moment.utc().format();

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
    return this.adapter.save({
      team: this.message.team_id,
      channel: this.message.channel,
      channel_type: this.message.channel_type,
      user: this.message.user,
      method: this.message.type,
      acronym: value || Analytics.decode(this.message.match[1]),
      action,
      found,
      timestamp
    });
  }
}