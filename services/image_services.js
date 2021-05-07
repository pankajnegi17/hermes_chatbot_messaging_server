const imageThumbnail = require("image-thumbnail"); 

const createThumbnail = async function(image_path, file_type='jpeg', responseType='base64', height=10,width=10){ 
        let thumbnail =  await  imageThumbnail(image_path, {responseType:responseType, height:height, width:width});
        return new Promise((resolve, reject)=>{
            resolve( "data:image/" + file_type + ";base64," + thumbnail)
        })  
}



exports.createThumbnail = createThumbnail