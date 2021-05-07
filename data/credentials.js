const credentials = [
   
    {username:"mark@hermes.com", password:"mark@123"},
    {username:"robin@hermes.com", password:"robin@123"},
    {username:"david@hermes.com", password:"david@123"},
    
]
// {username:"alvian@hermes.com", password:"alvian"},
// {username:"soparmarpaung@hermes.com", password:"soparmarpaung"},
// {username:"ronytan@hermes.com", password:"ronytan"},
// {username:"adekomariah@hermes.com", password:"adekomariah"},
// {username:"hidrian@hermes.com", password:"hidrian"},

const validate_user = (username, password) =>{
    console.log(username,password)
    for(let i=0; i<credentials.length; i++){
        console.log(credentials[i].username+" == "+username+" && "+credentials[i].password+ " == "+password)
        if(credentials[i].username == username && credentials[i].password == password){
            return true
        }
    }
    return false 
}

module.exports.validate_user =validate_user