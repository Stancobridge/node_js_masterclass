/**
 * Helper functions for the API
 * 
 */

 //Depencies
const crypto = require('crypto');
const config = require('./config');
const queryString = require("querystring");
const https= require('https');
const db = require('./database');



 //Helpers container
 const helpers = {};
 
 helpers.trimString = (str) => {
     str = str.replace(/^\/+|\/+$/g, '');
     return str;
 }

helpers.hash = (password) => {
  if(typeof(password) == 'string' && password.length > 0){
    let hash = crypto.createHmac('sha256', config.hashSecrete).update(password).digest('hex');
    return hash;
  } else{
      return false;
  }
}

//Parse a JSON string in all cases, without throwing
helpers.parseJsonToObject = (json) => {

    try{
        let obj = JSON.parse(json); 
        return obj;
    } catch(e) {
        return {};
    }
};

// Create a string of random alphanumeric charatecter of a given length
helpers.createRandomString = (strLength) => {
    strLength = typeof(strLength) == "number" && strLength > 0 ? strLength : 0;
    if(strLength) {
        // Define all the possible character that could go into a string
        var possibleCharacters = "abcdefghijklmnopqrstuvxyz0123456789";

        // Start the final string
        let str = ''; 
        for (let i = 0; i < strLength; i++) {
            // Get a random character from the possibleCharacters string
            let randomString = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            // Append this character to the final string
            str += randomString;
        }

        // Return the final string
        return str;

    } else{
        return false;
    }
}
 
helpers.sendTwilioSms = (phone,msg, callback) => {
    // Validate phone number and message
    phone = typeof(phone) == "string"  && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == "string"  && msg.trim().length > 0 && msg.trim().length < 1600 ? msg.trim() : false; 
    if(phone && msg) {
        // Configure the twilio request payload
        let payload = {
            "From" : config.twilio.fromPhone,
            "To" : "+234" + phone,
            "Body" : msg
        };
        // Stringify the payload
        let payloadString = queryString.stringify(payload);

        // Configure the request details
        let requestDetails = {
            'protocol' : 'https:',
            'hostname' : 'api.twilio.com',
            'method' : 'POST',
            'path' : "2010-04-01/Accounts/"+config.twilio.accountSid+"Message.json",
            'auth' : config.twilio.accountSid+":"+config.twilio.authToken,
            'headers' : {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length' : Buffer.byteLength(payloadString)
            }
        }

        let req = https.request(requestDetails, (res) =>{
            // Grab the status code from the resqust
            let status = res.statusCode;

            // Callback successfully if request went through
            if(status == 200 || status || 201) {
                callback(false);
            } else{
                callback("Status code returned was "+ status);
            }
        });

        // Bind to the Error Event so it doesn't get thrown
        req.on('error', (e) => {
            callback(e);
        });

        // Add the payload 
        req.write(payloadString);

        req.end();

    } else{
        callback("Invalid or Missing Parameters");
    }
};

// Trim for both string and numbers
helpers.trim = (data) => {
    if(typeof(data) == "number") {
        return data;
    } 
    if(typeof(data) == "string"){
        return data.trim();
    } 
    return false;
};

// Validate Data
helpers.validateData = (data, type, length = 0) => {

    let initialData = data;
    if(type == 'string'){  
        if(typeof(data) == `${type}`) {
            
            if(length == 0) {
                data = helpers.trim(data).length > 0 ? helpers.trim(data) : false;

            } else if(helpers.trim(data).length == Number.parseInt(length)) {
                data =  data.trim();
            } else if(data == 0) {        
                data =  data.trim();
            } else{
                data = false;
            }
        }  else {
            data = false;
        }

        if(!data) console.log(`Error validating ${JSON.stringify(initialData)} for type ${type} and length ${length}, check size or type for this data: ${JSON.stringify(initialData)}`);
        return data;
    } else if(type == "number") {
        if(typeof(data) == `${type}`) {
            if(length == 0) {
                data = helpers.trim(data).toString().length > 0 ? helpers.trim(data) : false;

            } else if(helpers.trim(data).length == Number.parseInt(length)) {
                data =  data.trim();
            } else if(data == 0) {        
                data =  data.trim();
            } else{
                data = false;
            }
        } else{
            data = false;
        }
        if(!data && data !== 0) console.log(`Error validating ${JSON.stringify(initialData)} for type ${type} and length ${length}, check size or type for this data: ${JSON.stringify(initialData)}`);
        return data;
    } else if(type == 'object') {
        data = typeof(data) == `${type}` && data != null  ? data : false;

        if(!data) console.log(`Error validating object ${JSON.stringify(initialData)} for not null, check size or type for this data: ${JSON.stringify(initialData)}`);
        return data;

    } else if(type == "boolean") {
        data = typeof(data) == `${type}` ? data : false;
        if(!data) console.log(`Error validating ${JSON.stringify(initialData)} for type ${type}, this data must return true to be valid`);

        return data;
    } else if(type == 'array' ){
        data = data instanceof Array  && data.length > 0? data : false;

        if(!data) console.log(`Error validating ${JSON.stringify(initialData)} for type ${type}, this data must be type of array`);

        return data;
    } else if(type == "email") {
        let isMail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
         
        if(isMail.test(String(data).toLowerCase())) {
            return data;
        } else{
            return false;
        };
    } else{
        return false;
    }
};
// Get user email for a Particular token
helpers.getUserEmail = (tokenId, callback) => {
    // Verify that token is valid
    tokenId = helpers.validateData(tokenId, 'string') && tokenId.trim().length == 20 ? helpers.validateData(tokenId, 'string') : false;

    if(tokenId){
        // Lookup the token 
        db.read('tokens', tokenId, (err, tokenData) => {
            if(!err && tokenData) {
                let {customerEmail} = tokenData;
                callback(false, customerEmail);
            } else{
                callback('Error reading token');
            }
        });
    } else{
        callback('Error: invalid token');
    }

}

// 

// Explicit validation 
helpers.validateExplicit = (data, callback) => {
    if(data) callback(data);
}
//Export the helpers container
 module.exports = helpers; 