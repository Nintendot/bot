import moment from 'moment';
import entities from 'entities';

const timestamp = moment.utc().format();

export default class Analytics {
  constructor({ teamId, adapter }) {
    this.teamId = teamId;
    this.adapter = adapter;
  }

  static decode(value) {
    return entities.decodeHTML(value);
  }

  static normalize(title) {
    return title.replace(/\W/g, '').toUpperCase();
  }

  async save({ channel, user, method, value, action, found}) {
    return this.adapter.save({
      team: this.teamId,
      channel,
      user,
      method,
      acronym: Analytics.decode(value),
      action,
      found,
      timestamp
    });
  }
}