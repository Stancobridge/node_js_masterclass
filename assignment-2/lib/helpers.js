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

        return data;
    } else if(type == 'object') {
        data = typeof(data) == `${type}` && data != null  ? data : false;

        return data;

    } else if(type == "boolean") {
        data = typeof(data) == `${type}` ? data : false;
        

        return data;
    } else if(type == 'array' ){
        data = data instanceof Array  && data.length > 0? data : false;


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
