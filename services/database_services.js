const pg = require('pg');
const Pool = pg.Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "HERMES_ED",
  password: "postgres",
  port: 5432,
});

const get_bot_response=(question)=>{
  const dbQuery = `SELECT answer from bot_qna where question='${question}' OR '${question}' =ANY(utterances)` 
  return new Promise((resolve, reject)=>{
    pool.query(dbQuery, (err, result)=>{       
      if(err){reject("Something bad happned to the server!")}
      else if(result.rows && result.rows.length>0){ 
        resolve(result.rows[0].answer[0])
      }
      else resolve("Sorry Im still learning!")
    })
  }) 
}

 
const get_notifier_groupid = (conversation_id, username)=>{
 return new Promise((resolve, reject)=>{
      const dbQuery = `select (array_remove("group_participants",'${username}')) as "participant" from group_data where group_id = '${conversation_id}'`
      console.log("dbQuery: ",dbQuery)
      pool.query(dbQuery, (err, result)=>{
    if(err){console.log("get_notifier_groupid: ERROR",err)
      reject([])}
    else {
      console.log("get_notifier_groupid: RESOLVED",result.rows[0].participant);
      resolve(result.rows[0].participant)}
})
})
}

/**MEthod fpr saving a message for a conversation */
const save_message = message =>{
  return new Promise((resolve, reject)=>{
    const dbQuery = `INSERT INTO messages("conversation_id", "group_id", "message_data", "creation_date", "delivered", "read")
     values('${message.conversation_id}','${message.conversation_id}','${ message.message_data}','${new Date().toLocaleString('en-US', {  hour12: true })}', '${message.delivered}', '${message.read}' )`;  
     pool.query(dbQuery, (err, result)=>{
       if(err)reject("ERROR")
       else resolve(result.rows)
     })
  })
}


const save_message_record = (conversation_id, Message)=>{
  console.log(new Date().toLocaleString())
return new Promise((resolve, reject)=>{  
  const dbQuery = `INSERT INTO chat_data("conversation_id", "group_id","Message","creation_date") values('${conversation_id}','${conversation_id}','${  Message}','${new Date().toLocaleString('en-US', {  hour12: true })}' )`;  

pool.query(dbQuery, (error, results) => {
  if (error)reject("error")
  else resolve(results.rows)
});})
}


const getGroupNamesByUserId = (username)=>{
  return new Promise((resolve, reject)=>{
    const dbQuery = `SELECT group_id from group_data WHERE  group_participants  @> ARRAY['${username}']` 
    pool.query(dbQuery, (error, result)=>{
      if(error) reject([])
      else resolve(result.rows)
    })
  })
}

module.exports.get_notifier_groupid = get_notifier_groupid
module.exports.get_bot_response = get_bot_response
module.exports.save_message_record = save_message_record
module.exports.save_message= save_message
module.exports.getGroupNamesByUserId =getGroupNamesByUserId