const fs = require('fs');

export default class localAnalytics {
    constructor() {
    }
    async save(data) {
        try {
            fs.appendFileSync('/tmp/localAnalytics.json', JSON.stringify(data) + '\n', {flag: 'a+'});
            console.log(`Analytics: data added from ${data.channel} by ${data.user} on acronym ${data.acronym}, action: ${data.action}`);
          } catch (err) {
            console.error("LocalAnalytic Error:", err);
          }
    }
}