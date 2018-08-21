import util from "util";
const BigQuery = require("@google-cloud/bigquery");

export default class bigQueryAdapter {
  constructor(db) {
    // TODO: save in env
    const projectId = process.env.GCPProjID;
    this.bigquery = new BigQuery({
      projectId: projectId
    });
  }

  paramQueryModel(q, title, user, value) {
    return {
      query: q,
      queryParameters: [
        {
          parameterType: {
            type: "STRING"
          },
          parameterValue: {
            value: `${title}`
          },
          name: "title"
        },
        {
          parameterType: {
            type: "STRING"
          },
          parameterValue: {
            value: `${user}`
          },
          name: "user"
        },
        {
          parameterType: {
            type: "STRING"
          },
          parameterValue: {
            value: `${value}`
          },
          name: "value"
        }
      ],
      parameterMode: "NAMED",
      useLegacySql: false // Use standard SQL syntax for queries.
    };
  }

  async read({ teamId, title }, failSafe = false) {
    const query = `select creator, definition from \`${teamId}.acronyms\` where acronym = @title`;
    return await this.bigquery
      .query(this.paramQueryModel(query, title))
      .then(results => {
        if (results[0].length == 0) {
          if (failSafe) {
            return undefined;
          } else {
            throw new Error(
              `:disappointed: I don't understand \`${title}\` yet, perhaps you could help me with it? \n :nerd_face: Teach me by typing \`\`\`@Botcronym ${title} means (definition)\`\`\``
            );
          }
        } else {
          return results[0];
        }
      }); // Error will be caught and handled in outer stack
  }

  async save({ teamId, title, value, user, overwrite }) {
    const exists = `select creator, definition from \`${teamId}.acronyms\` where acronym = @title and creator = @user`;
    return await this.bigquery
      .query(this.paramQueryModel(exists, title, user, value))
      .then(results => {
        if (results[0].length > 0) {
          // found the record in DB
          if (overwrite) {
            // acronym is already defined and action is to update it
            const update = `update \`${teamId}.acronyms\` set definition = @value where acronym = @title and creator = @user`;
            return this.bigquery
              .query(this.paramQueryModel(update, title, user, value))
              .then(results => {
                return results[0];
              }); // Error will be caught and handled in outer stack
          } else {
            // acronym is already defined but action is to define it
            throw new Error(
              `Hi <@${user}>, It seems like you have already defined \`${title}\`.` +
                "\n" +
                `Please use the update command to modify its meaning:` +
                "\n" +
                `\`\`\`@Botcronym update ${title} to (new definition)\`\`\`` +
                "\n" +
                `For detail syntax, check out \`\`\`/@Botcronym help\`\`\``
            );
          }
        } else {
          // no record found in DB
          if (overwrite) {
            // acronym is not already defined but action is to update it
            throw new Error(
              `Hi <@${user}>, Doesn't look like you have defined \`${title}\` previously.` +
                "\n" +
                `Please use the define command to explain this acronym:` +
                "\n" +
                `\`\`\`@Botcronym ${title} means (definition)\`\`\`` +
                "\n" +
                `For detail syntax, check out \`\`\`/@Botcronym help\`\`\``
            );
          } else {
            // acronym is not already defined and action is to define it
            const save = `insert into \`${teamId}.acronyms\` (acronym, creator, definition) values (@title, @user, @value)`;
            return this.bigquery
              .query(this.paramQueryModel(save, title, user, value))
              .then(results => {
                return results[0];
              }); // Error will be caught and handled in outer stack
          }
        }
      }); // Error will be caught and handled in outer stack
  }

  async delete({ teamId, title, user }) {
    const exists = `select creator, definition from \`${teamId}.acronyms\` where acronym = '${title}' and creator = '${user}'`;
    return await this.bigquery
      .query(this.paramQueryModel(exists, title, user))
      .then(results => {
        if (results[0].length > 0) {
          const del = `delete from \`${teamId}.acronyms\` where acronym = '${title}' and creator = '${user}'`;
          return this.bigquery
            .query(this.paramQueryModel(del, title, user))
            .then(results => {
              return results[0];
            });
        } else {
          throw new Error(
            `:disappointed: Hey <@${user}>, I don't think you have defined \`${title}\` previously`
          );
        }
      }); // Error will be caught and handled in outer stack
  }
}
