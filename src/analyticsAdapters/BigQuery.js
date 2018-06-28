import Bigquery from '@google-cloud/bigquery';
const env = require('./gcp_env');


export default class BigQuery {
    constructor() {
        this.bigquery = new Bigquery({projectId: env.gcp.proj_id});
        this.dataset = env.gcp.bq_dataset;
        this.table = env.gcp.bq_table;
    }

    async save(data) {
        this.bigquery
        .dataset(this.dataset)
        .table(this.table)
        .insert(data)
        .then(() => {
            console.log(`Analytics: data added from ${data.channel} by ${data.user} on acronym ${data.acronym}, action: ${data.action}`);
        })
        .catch(err => {
            if (err && err.name === 'PartialFailureError') {
                if (err.errors && err.errors.length > 0) {
                    console.log('Insert errors:');
                    err.errors.forEach(err => console.error(err));
                }
            } else {
                console.error('ERROR:', err);
            }
        });
    }
}