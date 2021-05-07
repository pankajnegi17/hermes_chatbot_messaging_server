'use strict'

const structJson = require('structjson')

module.exports = {    
    sendMessageToAgent: async function(text,parameters = {}){
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

    handleAction : function(responses){
        return responses;
    }
}