import Bigquery from "@google-cloud/bigquery";
const env = require("../../analyticsAdapters/analyticsEnv");
const fs = require("fs");

module.exports = function(webserver, controller) {
  webserver.get("/analytics/receive", function(req, res) {
    const bigquery = new Bigquery({ projectId: env.gcp.proj_id });

    bigquery
      .dataset(env.gcp.bq_dataset)
      .table(env.gcp.bq_table)
      .load(env.local.file)
      .then(() => {
        console.log("Analytics: local analytics data loaded");
        // Wipe the content of local analytics file
        fs.writeFileSync(env.local.file, "");
        res
          .status(200)
          .send("Done backing up analytics data")
          .end();
      })
      .catch(err => {
        console.error("ERROR:", err);
        res
          .status(500)
          .send("Bah, something went wrong when backing up analytics data")
          .end();
      });
  });
};
