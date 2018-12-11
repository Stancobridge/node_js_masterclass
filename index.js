/**
 * Primary file for the API
 * 
 */

 //Dependencies
    const http = require('http');
    const url = require('url');
    const StringDecoder = require('string_decoder').StringDecoder;
    const helpers = require('./lib/helpers');

    const serverPort = 8080;

    //Create a server
    let server = http.createServer((req, res) => {

        //Parse the requested URL
        let parseUrl = url.parse(req.url, true);

        //Get the requested path
        let path = parseUrl.pathname;

        //Trim slashes out of path
        let trimmedPath = helpers.stripSlashes(path);

        //Get the request headers as object
        let headers = req.headers;
        
        //Get request method
        let method = req.method.toLocaleLowerCase();

        //Get the QueryString as Object
        let queryStringObject = parseUrl.query;

        //Get any sent payloader
        let decoder = new StringDecoder('utf-8');
        let buffer = '';

        req.on('data', (data) => {
            buffer += decoder.write(data);
        });

        req.on('end', () => {
            buffer += decoder.end();

            
        //Get the called router and Use its handler if found or use notfound handler when handler is not defined
        let chosenHandler = typeof(router[trimmedPath]) != 'undefined' ? router[trimmedPath] : router.notFound;

        //Define the data object to send to the handler
        let data = {
            trimmedPath,
            method,
            queryStringObject,
            headers,
            'payload' : buffer
        };

 
        //Route the request to the specified handler
        chosenHandler(data, (statusCode, payload) => {

            //Use request statuscode or default to 200 if none is sent
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            //Use sent payload or default to empty object if none is sent 
            payload = typeof(payload) == 'object' ? payload : {};

            //Convert payload Object to string
            let payloadString = JSON.stringify(payload);
            
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);

            console.log({
                requestPath: trimmedPath,
                statusCode,
                data : JSON.stringify(payload)
            })


        res.end(payloadString);

        });

        });


    });

    server.listen(serverPort, () => {
        console.log(`Server started and listening to port ${serverPort}`)
    });

    //Define handlers
    let handlers = {};

    //Hello handler
    handlers.hello = (data, callback) =>{
        callback(200, {
            message : 'Welcome to Node Master Class, \n this is my first Assignment as presented by me (Okechukwu Somtochukwu Stanley)'
        });
    }

    //Not Found handler
    handlers.notFound = (data, callback) => {
        callback(404);
    }

    //Define request Route
    let router = {
        'hello' : handlers.hello,
        'notFound' : handlers.notFound
    }