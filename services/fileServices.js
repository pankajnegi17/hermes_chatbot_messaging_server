const fs = require('fs');
const readline = require('readline');
const path = require('path');

const processLineByLine = async function processLineByLine() {
    let questions = []
  const fileStream = fs.createReadStream('./data/auto_sugg/finance.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

 try{
    for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        questions.push(line) 
      }
 } 

 catch{
    return new Promise((resolve, reject)=>{
        reject(" Errror while Reading Autosuggetion Fro File")
      }); 
 }

  return new Promise((resolve, reject)=>{
    resolve(questions)
  });
}


const saveFile= function (file, path_to_file){
  
  return new Promise((resolve, reject)=>{  
    var base64Data = file.replace(/^data:image\/png;base64,/, "").replace(/^data:application\/pdf;base64,/, "") .replace(/^data:image\/jpeg;base64,/, "")  
 
    fs.writeFile(path_to_file, base64Data, 'base64', function(err) {
        if(err){
           console.log(err);
           reject({success:false, message:"File not saved"})
         }
         console.log("File saved")
          resolve({success:true, path:path_to_file})
  });
  })
}

const getFile = function(path_to_file){
  return new Promise((resolve, reject)=>{
    fs.readFile(path_to_file, {encoding: 'base64'}, (err, file)=>{
      if(err) reject("Error")
      else resolve(file)
    })
  })

}
exports.getFile =getFile

const  Uint8ToString =      function (u8a){
  var CHUNK_SZ = 0x8000;
  var c = [];
  for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
  }
  return c.join("");
}


module.exports.processLineByLine =processLineByLine
module.exports.saveFile = saveFile
module.exports.Uint8ToString = Uint8ToString