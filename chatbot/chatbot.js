'use strict'

const dialogFlow = require('dialogflow');
const config = require('../config/keys');
const structJson = require('structjson')

//const sessionClient = new dialogFlow.SessionsClient(); 
const sessionClient = new dialogFlow.SessionsClient({
    keyFilename: 'D:/Developement/React/reactbot/key/reactpageagent-wicmma-9b96f289a4ac.json'
});
const sessionPath = sessionClient.sessionPath(config.googleProjectID, config.dialogFlowSessionID);


module.exports = {    
    textQuery: async function(text,parameters = {}){
        //console.log("Coming");
        let self = module.exports;
        const request = {
            session: sessionPath,
            queryInput: {
                text: { 
                    text: text,
                    languageCode: config.dialogFlowSessionLanguageCode
                }
            },
            queryParams:{
                payload:{
                    data:parameters
                }
            }
        }; 
   
     let responses =  await sessionClient.detectIntent(request);   
     //response.set('Access-Control-Allow-Origin', 'domain.tld');
     responses = await self.handleAction(responses);           
      return responses[0].queryResult;

    },
    eventQuery: async function(event,parameters = {}){
        //console.log("Coming");
        let self = module.exports;
        const request = {
            session: sessionPath,
            queryInput: {
                event: { 
                    name: event,
                    parameters: structJson.jsonToStructProto(parameters),
                    languageCode: config.dialogFlowSessionLanguageCode
                }
            }
        }; 
   
     let responses =  await sessionClient.detectIntent(request);   
     responses = await self.handleAction(responses);        
   
      return responses[0].queryResult;

    },

    handleAction : function(responses){
        return responses;
    }
}