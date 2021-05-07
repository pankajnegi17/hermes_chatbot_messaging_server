const Pool = require('pg').Pool
const pool = new Pool({
  user: 'poatgres',
  host: 'localhost',
  database: 'Smsgroup',
  password: 'postgres',
  port: 5432,
})


module.exports = {    
  getMessagesByPID: async function(text,parameters = {}){
   // const id = parseInt(request.params.id)
   const pid = "p1";
  
   pool.query('SELECT * FROM chat_logging WHERE Fram_Participant_ID = $1', [pid], (error, results) => {
     if (error) {
       throw error
     }
     response.status(200).json(results.rows)
   })

  }}

 