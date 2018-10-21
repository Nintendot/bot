const fs = require("fs");
const env = require("./analyticsEnv");

export default class localAnalytics {
  constructor() {}
  async save(data) {
    try {
      fs.appendFileSync(env.local.file, JSON.stringify(data) + "\n", {
        flag: "a+"
      });
      console.log(
        `Analytics: data added from ${data.channel} by ${
          data.user
        } on acronym ${data.acronym}, action: ${data.action}`
      );
    } catch (err) {
      console.error("LocalAnalytic Error:", err);
    }
  }
}
