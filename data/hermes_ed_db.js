const { getUserDetais } = require("./users")

const user_details = [
    {username:'alvian@hermes.com', firstName:'Alvian', lastName:'', gropus:['group1', 'group2', 'group3'], lastActive:'12:13:11'},
    {username:'ronytan@hermes.com', firstName:'Rony', lastName:'Tan', groups:['group1', 'group3'], lastActive:'12:13:11'},
    {username:'hridian@hermes.com', firstName:'hridian', lastName:'', groups:['group2', 'group3'], lastActive:'12:13:11'}
]

const groups = [
    {groupId:'group1', members:['alvian@hermes.com', 'ronytan@hermes.com'], type:'individual', groupIcon:'', admins:[]},
    {groupId:'group2', members:['alvian@hermes.com', 'hridian@hermes.com'], type:'individual', groupIcon:'', admins:[]},
    {groupId:'group3', members:['alvian@hermes.com', 'ronytan@hermes.com', 'hridian@hermes.com'], type:'group', groupIcon:'path/to/image.jpg', admins:[]}
]

const pending_items =[ 
    {groupId:'group1', message:{from:'ronytan@hermes.com', data:{text:'Hi this is Rony!'}}, to:'alvian@hermes.com', itemType:'message'}
]

const message_data = [
    {groupId:'group1', message:{from:'ronytan@hermes.com', data:{text:'Hi this is Rony!'}}},
    {groupId:'group1', message:{from:'ronytan@hermes.com', data:{text:'Hi again this is Rony!'}}}
]

module.exports.setUserDetails = (userDetails) =>{
    user_details.push(userDetails)
    return true
}

module.exports.getUserDetais = (username) =>{
    return user_details.filter(user_detail=>user_detail.username == username)
}

module.exports.getAllUsers = ()=>{
    return user_detail;
}

module.exports.getGroupDetails = (...groupIds) =>{
    return groups.filter(group=> groupIds.includes(group.groupId))
}

module.exports.addGroup = (group)=>{
    groups.push(group);
    return true
}

module.exports.updateGroup = (group)=>{
    //replace group with new one
}

module.exports.addMessageData = ( data)=>{
    message_data.push(data);
    return true;
}

module.exports.getMessageData =(groupId)=> {
    return message_data.filter(message=>message.groupId == groupId)
}

module.exports.getPendingTasks = (username)=>{
    return pending_items.filter(item=>item.to == username)
}


module.exports.addPendingTasks = (task)=>{
   pending_items.push(task);
   return true;
}

module.exports.removePendingTasks = (username)=>{
    
}