    /**
     * Server Related task
     */

    //Dependencies 
    const http = require('http');
    const https= require('https');
    const url = require('url');
    const fs = require('fs');
    const helpers = require('./helpers');
    const StringDecoder = require('string_decoder').StringDecoder;
    const config = require('./config');
    const database = require('./database');
    const handlers = require('./handler');
    const path  = require('path');
    const util = require('util');
    const debug = util.debuglog('server');

    // Initialize the server module object
    const server = {};

    //Http Server
    server.httpServer = http.createServer((req, res) => {
        server.unifiedServer(req, res);
    });

    //HttpsServerOptions
    server.httpsServerOptions = {
        'key' : fs.readFileSync(path.join(__dirname, '/../https/key.perm')),
        'cert' : fs.readFileSync(path.join(__dirname, '/../https/cert.perm')) 
    };
    //Https Server
    server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
        server.unifiedServer(req, res);
    });

    //Unified Server
    server.unifiedServer = (req, res) => {
         //Get the URL and Parse it
         let parsedUrl = url.parse(req.url, true);

         //Get the path 
         let path = parsedUrl.pathname;
         let trimmedPath = helpers.trimString(path);
 
         //Get the query string as an object
         let queryString = parsedUrl.query;
 
         //Get the http method
         let method = req.method.toLowerCase();
 
         //Get the headers as an object
         let headers = req.headers;
 
         //Get the payload, if any
         let decoder = new StringDecoder('utf-8');
         let buffer  = '';
 
         req.on('data', (data) => {
             buffer += decoder.write(data);
         });
 
         req.on('end', () => {
             buffer += decoder.end();
 
             //Choose the handler this request should go to, if one is not found use the not found handler
             let chooseHandler = server.router.hasOwnProperty(trimmedPath) ? server.router[trimmedPath] : handlers.notFound;
              
             //Construct the data Objct to send to handler
             let data = {
                 trimmedPath,
                 queryString,
                 method,
                 headers,
                 payload : helpers.parseJsonToObject(buffer) 
             } 

             //Route the request to the ChoosenHandler 
             chooseHandler(data, (statusCode, payload) => {
                 //Use the statuscode by the handler or default to 200 
                 statusCode = typeof statusCode == "number" ? statusCode : 200;
 
                 //Use the payload defined by the handler or default to empty object
                 payload = typeof payload == "object" ? payload : {};
 
                 //Conver the payload to string
                 let payloadString = JSON.stringify(payload);
 
                 //Return the response
                 res.writeHead(statusCode, {
                     'Content-type': 'application/json'
                 });
                 res.end(payloadString);
 
                //  If the response is 200, print green or otherwaise print red;
                if(statusCode == 200) {
                    debug('\x1b[32m%s\x1b[0m',method.toUpperCase() +' /'+trimmedPath+ ' ' + statusCode);
                } else {
                    debug('\x1b[31m%s\x1b[0m',method.toUpperCase() +' /'+trimmedPath+ ' ' + statusCode);
                    debug('\x1b[31m%s\x1b[0m', payloadString);
                    
                }
                 
 
             });
             
         });
    };

    //Define a request router
    server.router = { 
        'users' : handlers.users,
        'tokens' : handlers.tokens,
        'checks' : handlers.checks,
        'menu' : handlers.menu,
        'carts' : handlers.carts,
        'order' : handlers.order
    };

    server.init = () =>{
            //listen to httpPort
            server.httpServer.listen(config.httpPort, () => {
                console.log('\x1b[36m%s\x1b[0m','Server started with port: ' + config.httpPort + ' in ' + config.envName + " mode");
    
            });

            //listen to httpsPort
            server.httpsServer.listen(config.httpsPort, () => {
                console.log('\x1b[35m%s\x1b[0m', 'Server started with port: ' + config.httpsPort + ' in ' + config.envName + " mode");

            });

    };
    // Export the whole server
    module.exports = server;