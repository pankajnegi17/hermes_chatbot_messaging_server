const nlpGateway_finance = "https://hermesbetahrkkkk.workflo.ai:19002/conversation/request/v0"
const nlpGateway_hrpro = "https://hermesbetahrnnn.workflo.ai:19001/conversation/request/v0"

const userdetails = {
    "mark@hermes.com":{fname:"Mark", lname:"",userType: "admin", username:"mark@hermes.com", nlpGateway:nlpGateway_finance, domains:["hr_finance", "hr_pro"], instance_type:["frontend", "backend"]},
    "robin@hermes.com":{fname:"Robin", lname:"",userType: "client", username: "robin@hermes.com", nlpGateway:nlpGateway_hrpro, domains:["hr_finance"], instance_type:["frontend"]},
    "david@hermes.com":{fname:"David", lname:"",userType: "client", username: "david@hermes.com", nlpGateway:nlpGateway_hrpro, domains:["hr_pro"], instance_type:["frontend"]}

}

const get_nlpUrl = (domain, instance_type)=>{
if(domain == 'hr_pro')
return nlpGateway_hrpro
else return nlpGateway_finance
}

const getUserDetais = (username) =>{
    return userdetails[username]
}

const validate_domain= (username, domain)=>{
    return userdetails[username].domains.includes(domain)
}

const validate_instance_type = (username, instance_type)=>{
    return userdetails[username].instance_type.includes(instance_type)
}

module.exports.getUserDetais = getUserDetais
module.exports.validate_domain= validate_domain
module.exports.validate_instance_type = validate_instance_type
module.exports.get_nlpUrl = get_nlpUrl