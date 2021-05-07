const uuid = require("uuid");
const pg = require("pg");
const path = require("path");
const { getUserDetais,  validate_domain, validate_instance_type, get_nlpUrl} = require("../data/users");
const { validate_user } = require("../data/credentials");
const { getQuestionsList } = require("../data/autoSuggetions");
const axios = require("axios");
const https = require("https");
const Pool = pg.Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "HERMES_ED",
  password: "postgres",
  port: 5432,
});
const { record_to_json, history_record_to_json, request_record_to_json, executeQuery,} = require("../services/store_procedure_services");
const { get_bot_response, save_message_record, get_notifier_groupid, } = require("../services/database_services");
const file_services = require("../services/fileServices");
const imageThumbnail = require("image-thumbnail"); 
const imageServices = require('../services/image_services')

// const redis = require("redis");
// const client = redis.createClient();

//Will listen to all errors occure in client
// client.on("error", (err) => {
//   console.log(err);
// });

var types = pg.types;
types.setTypeParser(1114, function (stringValue) {
  return new Date(stringValue + "+0000");
});

let count = 0;

let visitor_number = 0;

function getUserDetails(email) {
  pool.query(`select fname`);
}

function verifyUserDetails(user_credentials) {
  return new Promise(function (resolve, reject) {
    const login_status = validate_user(
      user_credentials.username,
      user_credentials.password
    );
    if (login_status) {
      let isValidInstance = validate_instance_type(
        user_credentials.username,
        user_credentials.instance_type
      );
      if (!isValidInstance) {
        return reject({
          status: "access_denied",
          message: `Not allowed to access ${user_credentials.instance_type} Instance`,
        });
      }
      let isAllowed = validate_domain(
        user_credentials.username,
        user_credentials.domain
      );
      if (!isAllowed) {
        return reject({
          status: "access_denied",
          message: `Not allowed to access ${user_credentials.domain} data`,
        });
      }
      const user = getUserDetais(user_credentials.username);
      const nlpUrl = get_nlpUrl(user_credentials.domain)
      return resolve({...user, nlpUrl});
    } else reject("Incorrent Password");
  });
}

function generateToken(user) {
  console.log("Generating Tokens Start.............");
  const token = user.username + "dkhasd62874jhdgjf46";
  user_detail = {
    JSESSIONID: token,
    userDetails: user,
  };
  const response = new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("\tToken generated\n");
      resolve(user_detail);
    }, 2000);
  });
  return response;
}

module.exports = (app) => {
  app.get("/deletechatdata", (req, res) => {
    const dbQuery = `delete from chat_data`;
    pool.query(dbQuery, (err, result) => {
      res.status(200).json({ status: "Chat Deleted" });
    });
  });

  app.get("/getAutoSuggetions", (req, res) => {
    console.log(req.query.userType);
    res
      .status(200)
      .json({
        questions: getQuestionsList(req.query.userType, req.query.domain),
      });
  });

  /**This API shoud called when users selects a chat */
  app.get("/fetchChatByCid", (req, res) => {
    const dbQuery_bcp = `select * from (select * , (array_remove("group_participants",'ronytan@hermes.com'))[1] as "participant"
    from chat_data cd
    Inner join public.group_data as gd ON (cd."conversation_id" = gd."group_id" )
    where ("conversation_id" = '${req.query.conversation_id}'
    )) pp
    inner join login_data as ld ON (pp.participant = ld.username ) ORDER BY s_no ASC`;

    const dbQuery = `SELECT "Message" FROM "chat_data" WHERE "conversation_id" = '${req.query.conversation_id}'  ORDER BY s_no ASC`

    pool.query(dbQuery, (err, result) => {
      if (err) {
        throw err;
      } else {
        console.log(result.rows)
        res.status(200).json(result.rows);
      }
    });
  });

  app.get("/clearcurrentchat", (req, res) => {
    const dbQuery = `delete from chat_data WHERE conversation_id = '${req.query.conversation_id}'`;
    pool.query(dbQuery, (err, result) => {
      if (err) {
        res.status(201).json({ status: "Not able to clear" });
      } else {
        res.status(201).json({ status: "Chat cleared" });
      }
    });
  });

  app.post("/varifyUser", async (req, res) => {
    const user_credentials = {
      username: req.body.username,
      password: req.body.password,
      domain: req.body.domain,
      instance_type: req.body.instance_type,
    };

    try {
      await verifyUserDetails(user_credentials)
        .then((user) => {
          generateToken(user).then((userdetails) => {
            return res.status(200).json(userdetails);
          });
        })
        .catch((err) => {
          console.log(err);
          if (err && err.status == "access_denied")
            res.status(403).json(err.message);
          else res.status(401).json(err);
        });
    } catch (err) {
      res.status(403).json(`Something Went wrong!!`);
    }
  });

  //API for fetching caonversation based on GID
  app.get("/getConversation", async (req, res) => { 
    let newdbq = "";

    if (
      req.query.searchForDataFromDate != "" &&
      req.query.searchForDataFromDate != undefined
    ) {
      newdbq = `select * from (select * , (array_remove("group_participants",'${
        req.query.username
      }'))[1] as "participant" 
      from chat_data cd
      Inner join public.group_data as gd ON (cd."conversation_id" = gd."group_id" )       
      where ('${req.query.username}' = ANY(group_participants) 
      AND 
      "server_timestamp" > timestamp '${req.query.searchForDataFromDate.replace(
        "T",
        " "
      )}')) pp 
      inner join login_data as ld ON (pp.participant = ld.username ) ORDER BY s_no ASC`;
    } else {
      newdbq = `select * from (select * , (array_remove("group_participants",'${req.query.username}'))[1] as "participant" from chat_data cd
  Inner join public.group_data as gd ON (cd."conversation_id" = gd."group_id" )       
  where ('${req.query.username}' = ANY(group_participants) ) ) pp 
  inner join login_data as ld ON (pp.participant = ld.username ) ORDER BY s_no ASC`;
    }

    pool.query(newdbq, (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows);
    });
  });

  //API for display list of chat history
  app.get("/getConversationsList", async (req, res) => {
    count++;
    let agent_id = "'" + req.query.agent_id + "'";
    var db =
      `SELECT DISTINCT ON ("group_id") * from
    (select * from group_data where ` +
      agent_id +
      ` = ANY(group_participants))p
    INNER JOIN 
    public.login_data as ld ON (ld."username" = any(array_remove(p."group_participants",` +
      agent_id +
      `)))`;
    pool.query(db, (error, result) => {
      if (error) {
        throw error;
      }
      // console.log("\ngetConversationsList() Query: "+ db+"\n")
      // console.table(result.rows)
      res.status(200).json(result.rows);
    });
  });

  app.post("/executeQuery", (req, res) => {
    pool.query(`${req.body.sql}`, (err, result) => {
      try {
        if (err) {
          throw err;
        }
        res.status(200).json({ status: "Success" });
      } catch (err) {
        res.status(200).json({ status: "Error" + err.detail });
      }
    });
  });

  app.post("/createUser", async (req, res) => {
    const selectUser_dbQuery = `select * from login_data where username = '${req.body.user.username}'`;
    const selecNotifier_dbQuery = `select * from group_data where group_id = '${req.body.user.username}'`;

    const createNotifier_dbQuey = `INSERT INTO  group_data(
      group_id, group_name, group_participants, group_type)
      VALUES ('${req.body.user.username}', 'Notifications', ARRAY['notifier@hermes.com', '${req.body.user.username}'], 'Notifier')`;

    const createUser_dbQuery = `INSERT INTO  login_data(
        fname, lname, username, password, user_type, designation, teams)
        VALUES ('${req.body.user.fname}', '${req.body.user.lname}', '${req.body.user.username}', '${req.body.user.password}', '${req.body.user.user_type}',
         '${req.body.user.designation}', ARRAY['BOTAIML']);`;

    pool.query(createUser_dbQuery, (err, user) => {
      if (err) console.log(err);
      console.log(`User ${req.body.user.fname} created!`);
    });

    pool.query(createNotifier_dbQuey, (err, result) => {
      if (err) console.log(err);
      console.log("Notifier Added for " + req.body.user.fname);
      res.status(201).json({ status: "User data created" });
    });
  });

  const saveGroupData = (req, res, from, to, group_type) => {
    console.log("Group Type: " + group_type);

    let group_name = "";

    if (group_type == "Notifier") {
      group_name = "Notifications";
    } else if (group_type == "BOT") {
      group_name = "HERMES";
    } else {
      group_name = "MY GROUP NAME";
    }

    let groupId;
    if (req.query.isNotifier) {
      groupId = from;
    } else {
      groupId = `${uuid()}`;
    }

    const dbQuery =
      "insert into group_data VALUES(" +
      `'${groupId}'` +
      ",'" +
      group_name +
      "', ARRAY [ " +
      from +
      "," +
      to +
      "], " +
      group_type +
      ")";
    //  console.log("\t dbQuery: "+dbQuery)

    console.log(dbQuery);
    pool.query(dbQuery, (error, result) => {
      try {
        if (error) {
          throw error;
        }
        // console.log("\t new group record added : "+groupId)
        res.status(200).json(groupId);
      } catch {
        res.status(200).json(groupId);
      }
    });
  };

  //API for setting up Conversaion Ids and Group Ids for new or old conversations
  app.get("/setConversationDetails", async (req, res) => {
    console.log("Inside setConversationDetails");
    const from = "'" + req.query.from + "'";
    const to = "'" + req.query.to + "'";
    const group_type = "'" + req.query.group_type + "'";

    if (group_type == undefined || group_type == "") {
      group_type = "'individual'";
    }

    //if type = "individual"
    const dbQueryIndividual =
      `select * from group_data 
where(
(group_participants[1] = ` +
      to +
      `or group_participants[2] = ` +
      to +
      `)
AND
 (group_participants[1] = ` +
      from +
      ` or group_participants[2] = ` +
      from +
      `)
) 
AND ("group_type" = 'individual' OR  "group_type" = 'BOT' ) `;

    // console.log("\t dbQueryIndividual: "+dbQueryIndividual)
    //if record found return it else create new record and retutn it
    // var conversation_details = "1111-1111-1111-1111"
    // res.status(200).json(conversation_details);

    ////console.log(dbquery);

    pool.query(dbQueryIndividual, (error, result) => {
      if (error) {
        throw error;
      }
      // console.log(result)

      result.rows.length > 0
        ? res.status(200).json(result.rows[0].group_id)
        : saveGroupData(req, res, from, to, group_type);
    });
  });

  //Gettting user details
  app.get("/getUserDetails", (req, res) => {
    const username = req.query.username;
    const dbquery = `SELECT * from login_data WHERE username = '${username}'`;
    pool.query(dbquery, (err, result) => {
      if (err) throw err;
      res.status(200).json(result.rows);
    });
  });

  app.post("/getImage", async (req, res) => {
    console.log(req.body.file_path);
    let data_string = await file_services.getFile(req.body.file_path);
    res.status(200).json("data:image/png;base64," + data_string);
  });

  app.post("/getFile", async (req, res) => {
    console.log(req.body.file_path);

    let data_string = await file_services.getFile(req.body.file_path);
    res.status(200).json(data_string);   
  });
  //API to Insert message data to database
  app.post("/sendMessage", async (req, res) => { 
    
    //Finding File extention
    let file_type = "unknown";
    let Message_data = req.body.Message.Message_data;
    if (
      Message_data.type == "file_attachement" ||
      Message_data.type == "image_attachement"
    ) {
      //Add propery if req contail image or file
      Message_data.file_path = [];

      if (Message_data.type == "image_attachement") {
        for(let i=0; i<Message_data.data.length; i++){
           
        //Getting file type
        file_type = Message_data.data[i].substring(
          "data:image/".length,
          Message_data.data[i].indexOf(";base64")
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
      let file_message = await file_services.saveFile(
        Message_data.data[i],
        localtion_to_file
      );
      //Adding thumbnail bae64 string to data property of message
      if (file_type == "jpg" || file_type == "jpeg" || file_type == "png"){
        //Getting thumbnail  
        Message_data.data[i] =  await imageServices.createThumbnail(file_message.path, file_type)   
 
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
    } else {}
  }

    //Stringifying message data in order to store to DB
    const MESSAGE = JSON.stringify(req.body.Message);

    //Saving data to notifire
    get_notifier_groupid(req.body.conversation_id, req.body.from)
      .then((cid_to_be_notified) => {
        console.log("cid_to_be_notified: ", cid_to_be_notified);
        for (let i = 0; i < cid_to_be_notified.length; i++) {
          let x = save_message_record(cid_to_be_notified[i], MESSAGE);
          if (x == "error") continue;
        }
      })
      .catch();

    //Saving Message data to DB  
    save_message_record(req.body.conversation_id, MESSAGE).then((results) => {
      res.status(200).json(results.rows);
    });
  });

  //API to catagorized the list of employees based on their designation
  app.get("/getDesignationListByTeamID", async (req, res) => {
    return res.status(200).json([
      { designation: "Production Manager", team: "BOTAIML" },
      { designation: "Product Head", team: "BOTAIML" },
      { designation: "Database Manager", team: "BOTAIML" },
    ]);
  });

  //API to display employees for specified designation
  app.get("/getEmployeesListByDesignation", async (req, res) => {
    if (req.query.designation == "Production Manager")
      return res
        .status(200)
        .json([
          { fname: "Thomas", lname: "Murray", username: "thomas@hermes.com" },
        ]);
    else if (req.query.designation == "Product Head") {
      return res
        .status(200)
        .json([
          { fname: "Simon", lname: "Roup", username: "simon@hermes.com" },
        ]);
    } else if (req.query.designation == "Database Manager") {
      return res
        .status(200)
        .json([{ fname: "Lori", lname: "Roby", username: "lori@hermes.com" }]);
    } else {
      //Filter the user and remove the current user
      //TODO
  // cc = {    "adekomariah@hermes.com":{fname:"Ade", lname:"Komariah",userType: "client", username:"adekomariah@hermes.com", nlpGateway:nlpGateway_finance,domains:["hr_pro"], instance_type:["frontend"]},
  //     "alvian@hermes.com":{fname:"Alvian", lname:"",userType: "client", username:"alvian@hermes.com", nlpGateway:nlpGateway_finance, domains:["hr_finance", "hr_pro"], instance_type:["frontend"]},
  //     "ronytan@hermes.com":{fname:"Rony", lname:"Tan",userType: "admin", username:"ronytan@hermes.com", nlpGateway:nlpGateway_finance, domains:["hr_finance", "hr_pro"], instance_type:["frontend", "backend"]},
  //     "soparmarpaung@hermes.com":{fname:"Sopar", lname:"Marpaung",userType: "admin", username: "soparmarpaung@hermes.com", nlpGateway:nlpGateway_hrpro, domains:["hr_finance", "hr_pro"], instance_type:["frontend", "backend"]},
  //     "hidrian@hermes.com":{fname:"Hidrian", lname:"",userType: "client", username: "hidrian@hermes.com", nlpGateway:nlpGateway_hrpro, domains:["hr_pro", "hr_finance"], instance_type:["frontend"]},
  //  }
      let empList = [
        { fname: "Hermes", lname: "BOT", username: "bot@hermes" },
        {fname: "Mark", lname: "", username:"mark@hermes.com"},
        {fname: "Robin", lname: "", username:"robin@hermes.com"},
        {fname: "David", lname: "", username:"david@hermes.com"},
      ];

      const filtered_users = empList.filter(
        (user) => user.username != req.query.username
      );
      return res.status(200).json(filtered_users);
    }
  });

  //API for setting up Conversaion Ids and Group Ids for new or old conversations
  app.get("/setHermesConversationDetails", async (req, res) => {
    const from = "'" + req.query.from + "'";
    const to = "'" + req.query.to + "'";
    //if type = "individual"
    const dbQueryIndividual =
      `select * from group_data 
    where(
    (group_participants[1] = ` +
      to +
      `or group_participants[2] = ` +
      to +
      `)
    AND
    (group_participants[1] = ` +
      from +
      ` or group_participants[2] = ` +
      from +
      `)
    ) 
    AND "group_type" = 'individual' `;
    pool.query(dbQueryIndividual, (error, result) => {
      if (error) {
        throw error;
      }
      result.rows.length > 0
        ? res.status(200).json(result.rows[0].group_id)
        : saveGroupData(req, res, from, to);
    });
  });

  //Fake NLP Response for request API
  app.post("/conversion/request/v0", async (req, res) => {
    console.log(req.body);

    const QUERY = req.body.MESSAGE.QUERY;
    const QUERY_UUID = req.body.MESSAGE.QUERY_UUID;
    //GET THE ANSWER AND PASS IT RESPONSE TO REDIS ALONG WITH QUERY_UUID
    let bot_response = await get_bot_response(QUERY);
    console.log("\t\t", bot_response);
    const resp = {
      MESSAGE: {
        QUERY_UUID: QUERY_UUID,
        QUERY: QUERY,
        CONTEXT: "TAB-DB-QUERY-BOC",
        HEADER: "",
        BODY: bot_response,
        BODYTYPE: "STRING",
        IFRAME: "",
      },
    };
    // client.set(QUERY_UUID, JSON.stringify(resp), "EX", 60, (err, message) => {
    //   if (err) throw err;
    //   res.status(200).json({
    //     MESSAGE: {
    //       ERRORCODE: "00",
    //     },
    //   });
    // });
  });

  //Fake NLP Response for response API
  app.post("/conversion/response/v0", async (req, res) => {
    const response_type_list = {
      MESSAGE: {
        QUERY_UUID: "1038ea7-dbe4-2557-c02b-36dea03de16",
        QUERY: "list employees",
        CONTEXT: "TAB-DB-QUERY-BOC",
        HEADER: "Below is the list of  employees",
        BODY: [],
        BODYTYPE: "LIST",
        IFRAME: "https://www.botaiml.com",
      },
    };
    const QUERY_UUID = req.body.MESSAGE.QUERY_UUID;
    // client.get(QUERY_UUID, (err, reply) => {
    //   res.status(200).json(JSON.parse(reply));
    // });
  });

  app.post("/conversation/request/v0", (req, res) => {
    const dummy_nlp_response = {
      MESSAGE: {
        QUERY: "how many employees come to office on 20th september 2020",
        QUERY_UUID: "72c1fe-aee5-3e22-53bf-85aa140caa8",
        RESULT: [
          {
            BODY: "6",
            BODYTYPE: "STRING",
            CONTEXT: "NA",
            HEADER: "",
            IFRAME: "https://www.botaiml.com",
          },
          {
            BODY: "6",
            BODYTYPE: "STRING",
            CONTEXT: "NA",
            HEADER: "",
            IFRAME: "",
          },
          {
            BODY: [
              {
                attendance: "Present",
                attendance_date: "2020-09-20",
                emp_no_: 170426004,
                name: "GARA PRAKASA",
              },
              {
                attendance: "Present",
                attendance_date: "2020-09-20",
                emp_no_: 940822002,
                name: "CAWISADI PANGESTU",
              },
              {
                attendance: "Present",
                attendance_date: "2020-09-20",
                emp_no_: 51201005,
                name: "WIDYA NURDIYANTI",
              },
              {
                attendance: "Present",
                attendance_date: "2020-09-20",
                emp_no_: 10522005,
                name: "ALMIRA YULIANTI",
              },
              {
                attendance: "Present",
                attendance_date: "2020-09-20",
                emp_no_: 960229004,
                name: "KARIMAN TAMBA",
              },
              {
                attendance: "Present",
                attendance_date: "2020-09-20",
                emp_no_: 170426005,
                name: "GALAR PRASETYO",
              },
            ],
            BODYTYPE: "LIST",
            CONTEXT: "NA",
            HEADER: "Here is the result",
            IFRAME: "",
          },
        ],
      },
    };

    res.status(200).json(dummy_nlp_response);
  });

  app.get("/Bird/Auth", async (req, res) => {
    let url = `https://104.211.226.244:9443/Bird/Auth?userName=${req.query.userName}m&password=${req.query.password}`;

    const tokens = await axios
      .get(url, {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        withCredentials: true,
      })
      .then((tokens) => {
        console.log("then run");
        return tokens;
      })
      .catch((err) => {
        console.log("catch run");
        return {
          headers: {
            "set-cookie": [
              "JSESSIONID=99Thisisfaketoken88; Path=/Bird; Secure; HttpOnly",
            ],
          },
        };
      });
    const cookies_string = tokens.headers["set-cookie"][0];
    const cookies_value = cookies_string.slice(11, cookies_string.indexOf(";"));
    let options = {
      path: "/Bird",
      httpOnly: false,
      // signed: true // Indicates if the cookie should be signed
      SameSite: "None",
    };
    // Set cookie
    // res.cookie('JSESSIONID', cookies_string, options) // options is optional
    res.status(200).json({ JSESSIONID: cookies_value });
    // res.send("Cookies")
  });

  //Fake NLP Response for request API
  app.post("/workflow", async (req, res) => {
    let sp_resp;
    console.log(req.body);
    const QUERY = req.body.MESSAGE.QUERY;
    const QUERY_UUID = req.body.MESSAGE.QUERY_UUID;

    //GET THE ANSWER AND PASS IT RESPONSE TO REDIS ALONG WITH QUERY_UUID
    // this.executeQuery =
    let sp_response = await executeQuery({
      userinput: req.body.MESSAGE.QUERY,
      session: req.body.MESSAGE.SESSION_ID,
    });
    stringifyResponse = JSON.stringify(sp_response);

    if (stringifyResponse.includes("|") && !stringifyResponse.includes("||")) {
      let datacard_json =
        stringifyResponse != undefined
          ? record_to_json(stringifyResponse)
          : "Response is not defined";
      console.log(datacard_json);
      sp_resp = {
        MESSAGE: {
          QUERY_UUID: QUERY_UUID,
          QUERY: QUERY,
          CONTEXT: "TAB-DB-QUERY-BOC",
          HEADER: "Here is the claim details",
          BODY: datacard_json,
          BODYTYPE: "STATUS_DATA",
          IFRAME: "",
        },
      };
    } else if (
      stringifyResponse.includes("|") &&
      stringifyResponse.includes("||") &&
      !stringifyResponse.includes(
        "Your leave request has been submitted with the following details"
      )
    ) {
      stringifyResponse = stringifyResponse.replace(/"/g, "");
      stringifyResponse = stringifyResponse.replace(/'/g, '"');
      console.log("stringifyResponse", stringifyResponse);
      let record_array = stringifyResponse.split("||");
      console.log("record_array:  ", record_array);

      let datalist = record_array.map((e) => {
        return history_record_to_json('"' + e + '"');
      });

      console.log("datalist: ", datalist);
      sp_resp = {
        MESSAGE: {
          QUERY_UUID: QUERY_UUID,
          QUERY: QUERY,
          CONTEXT: "TAB-DB-QUERY-BOC",
          HEADER: "Here is the list",
          BODY: datalist,
          BODYTYPE: "LIST",
          IFRAME: "",
        },
      };
    } else if (
      stringifyResponse.includes("||") &&
      stringifyResponse.includes(
        "Your leave request has been submitted with the following details"
      )
    ) {
      let datacard_json =
        stringifyResponse != undefined
          ? request_record_to_json(stringifyResponse)
          : "Response is not defined";
      console.log(datacard_json);
      sp_resp = {
        MESSAGE: {
          QUERY_UUID: QUERY_UUID,
          QUERY: QUERY,
          CONTEXT: "TAB-DB-QUERY-BOC",
          HEADER: "Here is the claim details",
          BODY: datacard_json,
          BODYTYPE: "REQUEST_STATUS",
          IFRAME: "",
        },
      };
    } else {
      sp_resp = {
        MESSAGE: {
          QUERY_UUID: QUERY_UUID,
          QUERY: QUERY,
          CONTEXT: "TAB-DB-QUERY-BOC",
          HEADER: "",
          BODY: stringifyResponse
            .replace(/"/g, "")
            .replace(/\|\|/g, " ")
            .replace(/\|/g, "\n"),
          BODYTYPE: "STRING",
          IFRAME: "",
        },
      };
    }
    // vall.replace("\{\"\"", "\{\"response_text\"")
    const resp_list = {
      MESSAGE: {
        QUERY_UUID: QUERY_UUID,
        QUERY: QUERY,
        CONTEXT: "TAB-DB-QUERY-BOC",
        HEADER: "Here is the claim details",
        BODY: [
          {
            status: "Approved",
            amount: "190000",
            remarks: "Credit expected within 5 working days",
          },
          {
            status: "Processing",
            amount: "20000",
            remarks: "Request un der processing",
          },
          {
            status: "Rejected",
            amount: "5000000",
            remarks: "Request has been rejected",
          },
        ],
        BODYTYPE: "LIST",
        IFRAME: "",
      },
    };

    res.status(200).json(sp_resp);
  });

  app.get("init");
};
