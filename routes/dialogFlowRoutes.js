const dialogFlow = require("dialogflow");
const config = require("../config/keys");
const chatbot = require("../chatbot/chatbot");

//const sessionClient = new dialogFlow.SessionsClient();
const sessionClient = new dialogFlow.SessionsClient({
  keyFilename:
    "D:/Developement/React/reactbot/key/reactpageagent-wicmma-9b96f289a4ac.json",
});

const sessionPath = sessionClient.sessionPath(
  config.googleProjectID,
  config.dialogFlowSessionID
);

module.exports = (app) => {
  app.get("/", async (req, res) => {
    res.send({ helo: "there" });
  });

  app.post("/api/df_text_query", async (req, res) => {
    let responses = await chatbot.textQuery(req.body.text);
    res.send(responses);
  });

  app.post("/api/df_event_query", async (req, res) => {
    let responses = await chatbot.eventQuery(
      req.body.event,
      req.body.parameters
    );
    res.send(responses);
  });

  app.post("/conversion/request/v0", async (req, res) => {
    const response = {
      RESPONSE_MSG: "MESSAGE PUBLISHED SUCCESSFULLY FOR FURTHER PROCESSING",
      ERRORCODE: "00",
    };
    res.send(response);
    res.json({ MESSAGE: response });
  });

  app.post("/conversion/response/v0", async (req, res) => {
    const response = {
      MESSAGE: {
        "QUERY-UUID": "cddfe821-e164-47e4-8cf4-5f0c889e7aae",
        "DATA-TYPE": "STRING",
        RESULT: [
          { SUBJECT: "", PROPERTY: "", VALUE: "adsasdasd adasda asadad as" },
          { SUBJECT: "", PROPERTY: "", VALUE: "" },
        ],
      },
    };
    res.send(response);
    res.json({ MESSAGE: response });
  });
};
