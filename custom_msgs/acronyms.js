module.exports = {

 defineAcronym : (acronym, expansion) => {

    var message = 
        {
          "attachments": [
            {
              "title": "Defining: " + acronym,
              "text" : "Are you sure `" + acronym + "` means: `" + expansion + "` ?" ,
              "fallback": "Oops, looks like something went south...",
              "callback_id": "define_acronym",
              "color": "#3AA3E3",
              "attachment_type": "default",
              "actions": [
                {
                  "name": acronym,
                  "text": "Yes",
                  "type": "button",
                  "value": expansion
                },
                {
                  "name": "No",
                  "text": "No",
                  "type": "button",
                  "value": "no",
                },
              ]
            }
          ]
        }
        return message;
    },

    deleteAcronym : (acronym, expansion) => {

      var message = 
          {
            "attachments": [
              {
                "title": "Removing: " + acronym,
                "text" : "Are you sure you want to remove`" + acronym + "`, which currently means: `" + expansion + "` ?" ,
                "fallback": "Oops, looks like something went south...",
                "callback_id": "remove_acronym",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                  {
                    "name": acronym,
                    "text": "Yes",
                    "type": "button",
                    "value": expansion
                  },
                  {
                    "name": "No",
                    "text": "No",
                    "type": "button",
                    "value": "no",
                  },
                ]
              }
            ]
          }
          return message;
      }
    }