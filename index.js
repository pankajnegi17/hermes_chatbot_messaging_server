const bodyParser = require('body-parser');
const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIo = require("socket.io");

const axios = require("axios/index");
const app = express();
var privateKey = fs.readFileSync('server-private-key.pem');
var certificate  = fs.readFileSync('server-public-key.crt');

var suggestions_routes = require('./routes/elasticSearchRoutes');  
let elastic = require('./services/elasticSearchServices');
let {processLineByLine} = require('./services/fileServices');
const message_services = require('./services/message_services');
const {handleNewActivity} = require('./services/activity_services');
const hermes_ed_db = require('./data/hermes_ed_db');
const database_services = require('./services/database_services'); 
const { 
  save_message_record
} = require("./services/database_services");
//   var privateKey = fs.readFileSync('server.key');
// var certificate  = fs.readFileSync('server.cert');
 
var credentials = {key: privateKey, cert: certificate}

app.use(bodyParser.json({limit: '10mb', extended: true}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const cookieParser = require('cookie-parser');
const { database } = require('firebase');
app.use(cookieParser('MY SECRET'));
  
require('./routes/databaseRoutes')(app); 
app.use('/suggetions', suggestions_routes);

function createIndex(){
  elastic.indexExists().then(function (exists) {  
    if (exists) {
      return elastic.deleteIndex();
    }
  }).then(function () {
    return elastic.initIndex().then(function () {
      console.log("Index initiated")
      let count = 0;
      let dataset =[]
      //Add a few titles for the autocomplete
      //elasticsearch offers a bulk functionality as well, but this is for a different time
      processLineByLine().then(questions=>{ 
        // console.log(questions)
        var promises = questions.map(function (question) {  
          // return elastic.addDocument({  
          //     body: {
          //       context: '',
          //       question: question
          //     }});


          dataset.push( {
              context: '',
              question: question
            })
 

        });

       elastic.addBulkDocuments(dataset)

        return Promise.all(promises);
      })
    });
  });
}

// createIndex()
 
var httpsServer = https.createServer(credentials, app)
httpsServer.listen(5015);

const io = socketIo(httpsServer);
io.on("connection", (socket) => {
  socket.emit('message', {data:'Connection Successful'})
  socket.emit('handshake', {socketId:socket.id})
  socket.on('connectRooms', data=>{
    //get all rooms for this data.user_id
    const rooms = hermes_ed_db.getUserDetais(data.user_id)[0].rooms 
    rooms.map(room=>socket.join(room)) 
  })

  /**This socket Room can be used for sending persisted notifications later */
  socket.on('createSelfRoom', data=>{
    //const socketId = data.socketId
    socket.join('room-'+data.username)
    socket.emit('selfRoomCreated', {socketId:socket.id})
    console.log(io.sockets.adapter.rooms)
  })

  socket.on('joinRooms', data=>{
    //data=> {username, socketId}
     database_services.getGroupNamesByUserId(data.username).then(groups=>{
      groups.map(group=>{
        console.log(`chat_room_${group.group_id} created ...`)
        return socket.join(`chat_room_${group.group_id}`)}) 
      socket.emit('joinRooms_ok',{})
    })    
  })

  socket.on('joinRoom', data=>{
    console.log(`chat_room_${data.group_id} created...`)
    socket.join(`chat_room_${data.group_id}`)    
    socket.emit('joinRoom_ok')
  })

  socket.on('HistoryChatUsers', (username)=>{
    const groups = hermes_ed_db.getUserDetais(username)[0].groups
    const group_details = hermes_ed_db.getGroupDetails(groups)
    socket.emit('HistoryChatUsers', {group_details})
  })


  socket.on('contacts', (username)=>{
    const users = hermes_ed_db.getAllUsers();
    socket.emit('contacts', {users})
  })

  socket.on('privateMessage', (data)=>{
    //Generate Message Record  
     message_services.generateMessage(data)
    .then(message=>{
      io.to(`chat_room_${data.conversation_id}`).emit('privateMessage',{data:[message]});
      save_message_record(data.conversation_id, JSON.stringify(message));    
    })
    .catch(err=>{
      console.log(`ERROR : Not able to sent to chat room`)
    })  
  })


  socket.on('newPrivateMessage', (data)=>{
    console.log('New Private Message Arrived')
    //Generate Message Record  
     message_services.generateMessage(data)
    .then(message=>{
      io.to(`room-${data.to}`).emit('privateMessage',{data:[message]});
      io.to(`room-${data.username}`).emit('privateMessage',{data:[message]});
      save_message_record(data.conversation_id, JSON.stringify(message));    
    })
    .catch(err=>{
      console.log(`ERROR : Not able to sent to chat room`)
    })  
  })

  socket.on('message', message=>{
    console.log(`MESSAGE RECIEVED FROM CLIENE! `);
    io.sockets.in(message.room).emit('message',message.text);
    message_services.handleNewMessage(message.text)
  })

  socket.on('userstatus', userstatus=>{
    // handleNewActivity(userstatus, JSON.stringify(socket))
  })
  
  socket.on("disconnect", () => {
    console.log("Client disconnected"); 
  });
});


