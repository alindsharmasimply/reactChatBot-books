"use strict";
import dialogflow from "dialogflow";
import config from "../config/keys.js";
import structjson from "../structjson.js";
import registration from "../models/Registration.js";

const projectID = config.googleProjectID;

const credentials = {
  client_email: config.googleClientEmail,
  private_key: config.googlePrivateKey.replace(/\\n/gm, "\n"),
};

console.log("GOOGLE PRIVATE KEY = ", credentials.private_key);
const sessionClient = new dialogflow.SessionsClient({ projectID, credentials });
// The path to identify the agent that owns the created intent.

export default class DFCtrl {
  static async api(req, res, next) {
    try {
      res.send({ Hello: "There" });
    } catch (error) {
      res.status(501).json({ error: error.message });
    }
  }
  static async apiTextQuery(req, res, next) {
    try {
      const sessionPath = sessionClient.sessionPath(
        config.googleProjectID,
        config.dialogFlowSessionID + req.body.userID
      );
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: req.body.text,
            languageCode: config.dialogFlowSessionLanguageCode,
          },
        },
        queryParams: {
          payload: {
            data: req.body.parameters,
          },
        },
      };
      let responses = await sessionClient.detectIntent(request);
      responses = await DFCtrl.handleAction(responses);
      res.json(responses[0].queryResult);
    } catch (error) {
      res.status(501).json({ error: error.message });
    }
  }
  static async apiEventQuery(req, res, next) {
    try {
      console.log("GOOGLE PRIVATE KEY = ", credentials.private_key);
      const sessionPath = sessionClient.sessionPath(
        config.googleProjectID,
        config.dialogFlowSessionID + req.body.userID
      );
      const request = {
        session: sessionPath,
        queryInput: {
          event: {
            name: req.body.event,
            parameters: structjson.jsonToStructProto(req.body.parameters),
            languageCode: config.dialogFlowSessionLanguageCode,
          },
        },
      };
      console.log(
        "PARAMETERS = ",
        JSON.stringify(structjson.jsonToStructProto(req.body.parameters))
      );
      let responses = await sessionClient.detectIntent(request);
      responses = DFCtrl.handleAction(responses);
      res.json(responses[0].queryResult);
    } catch (error) {
      res.status(501).json({ error: error.message });
    }
  }
  static handleAction(responses) {
    try {
      let queryResult = responses[0].queryResult;

      switch (queryResult.action) {
        case "recommendbooks-yes":
          if (queryResult.allRequiredParamsPresent) {
            DFCtrl.saveRegistration(queryResult.parameters.fields);
          }
          break;
      }
      return responses;
    } catch (error) {}
  }
  static async saveRegistration(fields) {
    const details = {
      name: fields.name.stringValue,
      address: fields.address.stringValue,
      phone: fields.phone.stringValue,
      email: fields.email.stringValue,
      dateSent: Date.now(),
    };
    try {
      const register = new registration(details);
      let reg = await register.save();
      console.log(reg);
    } catch (err) {
      console.log(err);
    }
  }
}
