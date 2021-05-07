const redis_services = require('./redis_services')
const database_servides = require('./database_services')
const { getAllUsers } = require('../data/hermes_ed_db')

const file_services = require("../services/fileServices"); 
const imageServices = require('../services/image_services');
const path = require("path");

const handleNewMessage = async (message) =>{
    //check for Active Status
    // const  active_socket_string = await redis_services.getFromRedis('active_'+'username');
    // const active_socket = JSON.parse(active_socket_string)
    
    //Emit message to user    
    // const isImited = active_socket.emit('message', {message:generateMessage(message)})

    //Save to Database (Pass message to a queue to save into database)
    message.pending = false;
    database_servides.save_message(message)
}


const generateMessage =  async(data) =>{ 
    return new Promise((resolve, reject)=>{
        if( data.Message.Message_data.type == "image_attachement" || data.Message.Message_data.type == "file_attachement"){
            addFilePath(data).then(data=>resolve(data))        
        }   
        else
        resolve(data)
    })
}


/** Take an Object and add file path property to is
 * Object must contain type property with accepted values file and image
 * Object must contain type data with accepted values Base64 Array [] 
 */
const addFilePath = async (data)=>{
    let Message_data = data.Message.Message_data
    //Finding File extention
    let file_type = "unknown"; 
        Message_data.file_path = [];
        if (Message_data.type == "image_attachement") {
        for(let i=0; i<Message_data.data.length; i++){
        //Getting image type
        file_type = Message_data.data[i].substring("data:image/".length,Message_data.data[i].indexOf(";base64"));
        //Defining file location
        let localtion_to_file = path.join("public","user_data","ronytan","media","images","IMG" + Date.now() + "." + file_type
        );
        //Saving File to Server
        let file_message = await file_services.saveFile(Message_data.data[i],localtion_to_file);
        //Adding thumbnail bae64 string to data property of images type message
        if (file_type == "jpg" || file_type == "jpeg" || file_type == "png"){
        //Getting thumbnail  
        Message_data.data[i] = await imageServices.createThumbnail(file_message.path, file_type)
    }
        else{
        //Removing existing pdf base64string
        Message_data.data[i] = ""
        }
    //add file entry for eacg file or image
        Message_data.file_path.push(localtion_to_file);
        }
        }
        
        else if (Message_data.type == "file_attachement") {
        for(let i=0;i<Message_data.data.length;i++){
            //Fetch file type
            file_type = Message_data.data[0].substring(
            "data:application/".length,
            Message_data.data[0].indexOf(";base64")
            );

            //Defining file location
        let localtion_to_file = path.join(
            "public",
            "user_data",
            "ronytan",
            "media",
            "images",
            "IMG" + Date.now() + "." + file_type
        );
    
    
        //Saving File to Server
            await file_services.saveFile(Message_data.data[i], localtion_to_file); 
        //Removing existing pdf base64string
            Message_data.data[i] = ""  
        //add file entry for eacg file or image
        Message_data.file_path.push(localtion_to_file);
        }
            } 
    else {
        console.log('FILE_TYPE_NOT RECOGNIZED..')
        return new Promise((resolve, reject)=>{
            reject(data);
        })
    }  
    //Finally return modified Message_Data Object wirh addition file path property  
    return new Promise((resolve, reject)=>{
        resolve(data);
    })
}

module.exports.handleNewMessage = handleNewMessage;
module.exports.generateMessage = generateMessage;
module.exports.addFilePath = addFilePath;