import util from 'util';
import get from 'lodash/get';
import set from 'lodash/set';
import has from 'lodash/has';

export default class LocalDBAdapter {
  constructor(db) {
    this._dbRead = util.promisify(db.get);
    this._dbSave = util.promisify(db.save);
    this._dbDelete = util.promisify(db.delete);
  }

  exist(data, path) {
    return has(data, path);
  }

  async save({ teamId, title, value, user }) {
    const newAcronym = { creator: user, definition: value };
    const data = await this._dbRead(teamId);
    // If exist
    if (this.exist(data, ['acronymsCollection', title])) {
      const acronymsAry = get(data, ['acronymsCollection', title]);
      if (acronymsAry.some(a => a.creator === user)) {
        throw new Error(
          `It seems like you have already defined ${title}. Please use the update command to update the value.`
        );
      }
      // if user definition not found
      acronymsAry.push(newAcronym);
      return this._dbSave(data);
    }
    // If doesn't exist
    const updateData = set(
      data,
      ['acronymsCollection', title, '0'],
      newAcronym
    );
    return this._dbSave(updateData);
  }
  async read({ teamId, title }, failSafe=false) {
    const data = await this._dbRead(teamId);
    if (!this.exist(data, ['acronymsCollection', title])) {
      if(failSafe) {
        return undefined;
      } else {
        throw new Error(`I don't understand \`${title}\` :disappointed:`);
      }
    }
    return get(data, ['acronymsCollection', title]);
  }
  async delete({ title, creator }) {}
}
