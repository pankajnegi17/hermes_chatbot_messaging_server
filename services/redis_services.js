const redis = require("redis");
const client = redis.createClient();
 
client.on("error", function(error) {
  console.error(error);
});
 
const setToRedis = (key, value) =>{
   return new Promise((resolve, reject)=>{
    client.set(key, value, (err, message)=>{
        if(err){
            reject(err)
        }
        else{
            resolve(message)
        }
    });
   }) 
}

const getFromRedis = (key) =>{
return new Promise((resolve, reject)=>{
    client.get(key, (err, message)=>{
        if(err) reject(err)
        else resolve(message)
    })
})
}

const deleteFRomRedis = key=>{
    return new Promise((resolve, reject)=>{
        client.del(key,(err, reply)=>{
            if(err)reject("ERR")
            else resolve(reply)
        })
    })
}


module.exports.setToRedis =  setToRedis
module.exports.getFromRedis =  getFromRedis
module.exports.deleteFRomRedis = deleteFRomRedis