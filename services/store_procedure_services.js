const sql = require('mssql');
var config = require('../config.json');

var value = "play the video where we talked about dummy data";

sql.on('error', err => {
    console.log(err);
})

let executeQuery = ({session, userinput})=>{
    
return new Promise((resolve, reject)=>{
    sql.connect(config).then(pool => {
        console.log(1078, session,userinput)
        return pool.request()
            .input('empid',  sql.Int, 1078)
            .input('session', sql.Int, session)
            .input('userinput', sql.VarChar(2000), userinput)
            .execute('USP_processClaim')
    }).then(result => {  

        if(result.recordset)
        {
             
                console.log(result.recordset[0][''] )
                resolve(result.recordset[0][''] )
         
        }

        else{
            resolve("Nothing to display.Try Again!")
        }
        
    }).then(() => {
        return sql.close();
    }).catch(err => {
        console.log(err);
        reject(err)
    })
})
}


const record_to_json = (record)=>{
  let stp_1 = "{"+record
  let stp_2 = stp_1 +  "}"
  let step_3 = stp_2.replace(/:/g, "\":\"")
  let step_4 = step_3.replace("|", "\",\"")
  let step_5 = step_4.replace("|", "\",\"remarks\":\"")
  let step_6 = step_5.replace(/'\s/g, "\'")
  let step_7 = step_6.replace(/\s'/g, "\'")
  console.log(step_7) 
let x = JSON.parse(step_7)
  var name, newName;
var newOutput = {}; 
for (var name in x) { 
  newName = name.trim(); 
  newOutput[newName] = x[name];
}
  return  newOutput
}




const history_record_to_json = (record)=>{
  let stp_1 = "{\"Leave Type\":"+record
  let stp_2 = stp_1 +  "}" 
  let step_4 = stp_2.replace("|", "\",\"From\":\"")
  let step_5 = step_4.replace("|", "\",\"To\":\"")
  let step_6 = step_5.replace("|", "\",\"Status\":\"")
  let step_7 = step_6.replace(/\s'/g, "\'")
  console.log(step_7)

 
let x = JSON.parse(step_7)
  var name, newName;
var newOutput = {};
// Loop through the property names
for (var name in x) {
  // Get the name without spaces
  newName = name.trim();
  
  // Copy the property over
  newOutput[newName] = x[name];
}
  return  newOutput
}


const request_record_to_json = (record)=>{

  let ste1 = record.replace("||","")
  let ste2 = ste1.replace(":","|")
  let ste3 = "{\"Header: "+ste2
  let ste4 = ste3.replace(/:/g, "\":\"")
  let step5 = ste4.replace(/\|/g, "\",\"")
  let ste6 = step5+"}"
  step6 =  ste6.replace("\"Your", "Your")

  console.log(step6) 
let x = JSON.parse(step6)
  var name, newName;
var newOutput = {}; 
for (var name in x) { 
  newName = name.trim(); 
  newOutput[newName] = x[name];
}
  return  newOutput
}


// let sql = require('mssql');

// let config = require('../config.json')


// let executeQuery = function(value) { 
//     console.log("This is VAlue : ",value)
//     return new Promise((resolve, reject)=>{
//         let conn = new sql.ConnectionPool(config);
//         conn.connect().then(function(conn) {
//           var request = new sql.Request(conn);
//           request.input('stmt', sql.VarChar(2000), value);
//           request.execute('findsyn').then(function(err, recordsets) {
//             console.log(returnValue)
//             if(err)reject(err)
//             else resolve(recordsets)
//             conn.close();
//           }).catch(function(err) {
//             reject(err)
//           });
//         });
//     })
   
// }

// // executeQuery("play the video where we talked about dummy data")

module.exports.executeQuery = executeQuery
module.exports.record_to_json = record_to_json
module.exports.history_record_to_json=history_record_to_json
module.exports.request_record_to_json = request_record_to_json