import entities from 'entities';

export default class Acronym {
  constructor({ teamId, title, adapter }) {
    this.teamId = teamId;
    this.title = Acronym.normalize(title);
    this.adapter = adapter;
  }

  static decode(value) {
    return entities.decodeHTML(value);
  }

  static normalize(title) {
    return title.replace(/\W/g, '').toUpperCase();
  }

  static getDefineMsg(title, value) {
    return {
      attachments: [
        {
          title: `Defining: ${title}`,
          text: `Are you sure ${title} means: ${value}?`,
          fallback: 'Oops, looks like something went south...',
          callback_id: 'define_acronym',
          color: '#3AA3E3',
          attachment_type: 'default',
          actions: [
            {
              name: title,
              text: 'Yes',
              type: 'button',
              value: value
            },
            {
              name: 'No',
              text: 'No',
              type: 'button',
              value: 'no'
            }
          ]
        }
      ]
    };
  }

  static getDeleteMsg(title, value) {
    return {
      attachments: [
        {
          title: `Removing: ${title}`,
          text: `Are you sure you want to remove ${title}, which currently means: ${value}?`,
          fallback: 'Oops, looks like something went south...',
          callback_id: 'remove_acronym',
          color: '#3AA3E3',
          attachment_type: 'default',
          actions: [
            {
              name: title,
              text: 'Yes',
              type: 'button',
              value: value
            },
            {
              name: 'No',
              text: 'No',
              type: 'button',
              value: 'no'
            }
          ]
        }
      ]
    };
  }

  async exist() {
    return await this.adapter.exist(this.title);
  }

  async read() {
    return this.adapter.read({ teamId: this.teamId, title: this.title });
  }

  async save({ value, user }) {
    return this.adapter.save({
      teamId: this.teamId,
      title: this.title,
      value: Acronym.decode(value),
      user
    });
  }

  async delete() {
    return this.adapter.delete({ teamId: this.teamId, title: this.title });
  }
}
