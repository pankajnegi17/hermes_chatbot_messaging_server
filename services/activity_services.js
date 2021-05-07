const redis_services = require('./redis_services')
const database_servides = require('./database_services')

const generateMessage = (message)=>{
    return message
}

const handleUserStatusActivity = async (userstatus, socketString='' ) =>{
    if(userstatus.value){
        await redis_services.setToRedis('active_'+userstatus.user_id, socketString)
    }
    else{
        await redis_services.deleteFRomRedis('active_'+userstatus.user_id)
    }
}




module.exports.handleNewActivity = handleUserStatusActivity;