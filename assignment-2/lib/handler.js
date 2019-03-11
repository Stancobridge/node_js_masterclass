/**
 * Request Handlers
 */

 //Dependencies
const db = require('./database');
const config = require('./config');
const helpers = require('./helpers');
const menu = require('./menu');
const carts = require('./carts');
const order = require('./order');

    //Define handlers
    let handlers = {};

    //User handler
    handlers.users = (data, callback) => {
        //Callback a http status code, and a payload object
        let acceptableMethod = [
            'get',
            'post',
            'delete',
            'put'
        ];

        let {method, payload, header, trimmedPath : {path}, queryString  } = data;
        if(acceptableMethod.includes(method)) {
            handlers._user[method](data, callback);
        } else{
            callback(405)
        }
        
    }

    //Container for users submethods
    handlers._user =  {}

    //User - Post
    //Required Fields: customerName, customerEmail, password, tosAgreement, customerAddress
    //Optional: None
    handlers._user.post = (data, callback) => {

        let {payload} = data;
        //Check that all the required the file are set
        let {customerName,customerEmail, customerAddress, password, tosAgreement } = payload;

        customerAddress = helpers.validateData(customerAddress, 'string');
        customerName = helpers.validateData(customerName, 'string');
        customerEmail = helpers.validateData(customerEmail, 'email');
        password = helpers.validateData(password, 'string');
        tosAgreement = helpers.validateData(tosAgreement, 'boolean');

        if(customerName && customerEmail && customerAddress && password && tosAgreement ){

            //Make sure that user doesn't already exist
            db.read('users', customerEmail, (err, data) => {
                
                if(err){
                    //Hash password
                    let hashedPassword = helpers.hash(password);

                    //Check if password is hased succesfully
                    if(hashedPassword){
                        //Create User Object
                        let userObj = {
                            customerName,
                            customerEmail,
                            customerAddress,
                            password: hashedPassword,
                            tosAgreement
                        };

                        //Store user data
                        db.create('users', customerEmail, userObj, (message, err) => {
                            if(!err){
                                console.log(message)
                                callback(200)
                            } else{
                                console.log(err)
                                callback(500, {Error: 'Could not create new user'})
                            }
                        });
                    } else{
                        callback(500, {Error: 'Password hash failed'})
                    }
                    
                } else{
                    callback(400, {Error: "A user with that email already exist"})
                }
            });


        } else{
            callback(400, {Error: 'Missing required field'});
        }
    };

    // Required fields: customerEmail, token
    // Optional: none
    // User - Get
    handlers._user.get = (data, callback) =>{
        //Vallidate customerEmail
        let {queryString: {custormeremail : customerEmail}, headers : {token}} = data;
        customerEmail = helpers.validateData(customerEmail, 'email');
        token = helpers.validateData(token, 'string', 20);

        // Get the token from the headers
        if(customerEmail){
            // Verify that the given token is valid for the customerEmail
            handlers._tokens.verifyToken(token, customerEmail, (tokenIsValid) => {
                if(tokenIsValid){

                    db.read('users', customerEmail, (err, data) => {
                
                        if(!err && data) {
                            // Remove the hashed password from the user before returning it to the callback
                            delete data.password
                            callback(200, data);
                        } else{
                            callback(404, {Error : 'User not found'});
                        }
                    });
                } else{
                    callback(403, {"Error" : "Missing Required token in header, or invalid token"});
                }
            });

        } else{
            callback(400, {"Error": "Missing Required field"});
        }
    };

    //User - Put
    // Required data : customerEmail
    // Optional data: firstname, lastName, password (at least one must be specified)
    handlers._user.put = (data, callback) => {

        // Check for the optional fields
        let {payload : {customerEmail, customerName, customerAddress, password}, headers : {token}} = data;
        customerEmail = helpers.validateData(customerEmail, 'email');
        password = helpers.validateData(password, 'string');
        customerName = helpers.validateData(customerName, 'string');
        customerAddress = helpers.validateData(customerAddress, 'string');
        token = helpers.validateData(token, 'string', 20);
 

        

        if(customerEmail || customerName || customerAddress || password) {
            // Verify that the given token is valid for the customerEmail 
            handlers._tokens.verifyToken(token, customerEmail, (tokenIsValid) => {

                if(tokenIsValid){
                    db.read('users', customerEmail, (err, data) => {
                        if(!err && data) {
                            // Update the fields necessary
                            if(customerName) {
                                data.customerName = customerName;
                            }
                            if(customerAddress){
                                data.customerAddress = customerAddress;
                            }
                            
                            if(password) {
                                data.password = password;
                            }
        
                            // Store the user data
                            db.update('users', customerEmail, data, (messsage, err) => {
                                if(!err){
                                    callback(200, messsage);
                                } else{
                                    console.log(err);
                                    callback(500, err)
                                }
                            });
                        } else {
                            callback(400, {Error: err});
                        }
                    });
                
                } else{
                    callback(403, {"Error" : "Missing Required token in header, or invalid token"})
                }
            });
     
        } else{
            callback(400, {Error : "Missing fields to update"})
        }
    };

    
    // User - Delete
    // Required field: custormeremail , token
    handlers._user.delete = (data, callback) => {
         //Vallidate customerEmail
         let {queryString: {custormeremail : customerEmail}, headers : {token}} = data;
         customerEmail = helpers.validateData(customerEmail, 'email');
         token = helpers.validateData(token, 'string', 20);
 
         if(customerEmail){
            // Verify that the given token is valid for the customerEmail
            handlers._tokens.verifyToken(token, customerEmail, (tokenIsValid) => {
                if(tokenIsValid){
                // Lookup the user
                db.read('users', customerEmail, (err, userData) => {
                    
                    if(!err && userData) {
                        db.delete('users', customerEmail, (message, err) => {
                            if(!err) {
                                // callback(200);
                                // Delete each of the checks associated with the user
                                let userChecks = typeof(userData.checks) == "object" && userData.checks instanceof Array ? userData.checks : [];
                                let checkToDelete = userChecks.length;
                                if(checkToDelete > 0) {
                                    let checksDeleted = 0;
                                    let deletionErrors = false;
                                    // Loop through the checks
                                    userChecks.forEach((checkId) => {
                                        // Delete the check
                                        db.delete('checks', checkId, (msg, err) => {
                                            if(err) {
                                                deletionErrors = true;
                                            }
                                            checksDeleted++;
                                            if(checksDeleted == checkToDelete) {
                                                if(!deletionErrors) {
                                                    callback(200);
                                                } else{
                                                    callback(500, {"Error" : "Error encountered why attempting to delete all of the use's checks. All checks may not have been deleted"})
                                                }
                                            }
                                        });
                                    });
                                } else{
                                    callback(200);
                                }
                                
                            } else {
                                callback(500, err);
                            }
                        })
                    } else{
                        callback(400, {Error : 'Could not find the specified User'});
                    }
                });
                } else {
                    callback(403, {"Error" : "Missing Required token in header, or invalid token"})

                }
            });
            
         } else{
             callback(400, {Error: "Missing Required field"})
         }
    };

    // Tokens Handler
    handlers.tokens = (data, callback) => {
        //Callback a http status code, and a payload object
        let acceptableMethod = [
            'get',
            'post',
            'delete',
            'put'
        ];

        let {method, payload, header, trimmedPath : {path}, queryString  } = data;
        if(acceptableMethod.includes(method)) {
            handlers._tokens[method](data, callback);
        } else{
            callback(405)
        }
        
    }
    // Container for all the tokens methods
    handlers._tokens = {};

    // Tokens - post
    // Required data: customerEmail, password
    // Optional data: none 
    handlers._tokens.post = (data, callback) => {
        let {customerEmail, password} = data.payload;
        customerEmail = helpers.validateData(customerEmail, 'string');
        password = helpers.validateData(password, 'string') && password.trim().length > 0 ? password.trim() : false;
        if(customerEmail && password){
            // Lookup the user who matches that customerEmail number
            db.read('users', customerEmail, (err, userData) => {
                if(!err && userData) {
                    // Hash the sent password, and compare it to the password stored in the user object
                    let hashedPassword = helpers.hash(password);
                    if(hashedPassword == userData.password){
                        // If valid, create a new token with a random name. Set expiration date 1 hour in the future
                        let tokenId = helpers.createRandomString(20);
                        let expires = Date.now() + 1000 * 60 * 60;
                        let tokenObj = {
                            customerEmail,
                            tokenId,
                            expires
                        };

                        //Store the token
                        db.create('tokens', tokenId, tokenObj, (msg, err) => {
                            if(!err) {
                                callback(200, tokenObj);
                            } else{ 
                                callback(500, {Error: "Unable to create to create token"})
                            }
                        }); 
                    } else{
                        callback(400, {Error : "Password authentication failed"}); 
                    }

                } else {
                    callback(400, {Error: "Could not find the specified user"});
                }
            });

        } else{
            callback(400, {Error: "Missing required field(s)"});
        }
    }

    // Tokens - get
    // Required data : id
    // Optional data: none
    handlers._tokens.get = (data, callback) => {
        // Check that the id that is sent is valid
        let {queryString: {id}} = data;
        id = typeof(id) == "string" ? id.trim() : false;
        if(id && id.length == 20){
            db.read('tokens', id, (err, tokenData) => {
                // Lookup the token
                if(!err && tokenData) {
                    delete data.password
                    callback(200, tokenData);
                } else{
                    callback(404, {Error : 'token not found'});
                }
            });
        } else{
            callback(400, {"Error": "Missing Required field"});
        }
    }

    // Tokens - put
    // Required data: id, extend
    // Optional data: none
    handlers._tokens.put = (data, callback) => {
        let {payload: {id, extend}} = data;

        id = helpers.validateData(id, 'string', 20);
        extend = helpers.validateData(extend, 'boolean');

        if(id && extend) {
            // Lookup the token
            db.read('tokens', id, (err, tokenData) => {
                if(!err && tokenData) {
                    // Check to make sure that toke isn't already expired
                    if(tokenData.expires > Date.now()){
                        // Set the expiration an hour 
                        tokenData.expires = Date.now() + 1000 * 60 * 60;

                        // Store the new update 
                        db.update('tokens', id, tokenData, (message, err) => {
                            if(!err) {
                                callback(200,{message});
                            } else{
                                callback(400, {Error : "Could not update the token's expiration"});
                            }
                        });
                    } else{
                        callback(400, {'Error' : "The token has already expired, and cannot be extended"})
                    }
                } else{
                    callback(400, {Error: 'Specified token does not exist'});
                }
            })
        } else{
            callback(400, {"Error" : "Missing required fields(s) or fields(s) are invalid "});
        }
       
    }

    // Tokens - delete
    // Required data: id
    // Optional data: none
    handlers._tokens.delete = (data, callback) => {
        // Check if id is valid
        let {queryString: {id}} = data;
        id = typeof(id) == "string" ? id.trim() : false;
        if(id){
            db.read('tokens', id, (err, data) => {
                
                if(!err) {
                    db.delete('tokens', id, (message, err) => {
                        if(!err) {
                            callback(200);
                        } else {
                            callback(500, err);
                        }
                    })
                } else{
                    callback(400, {Error : 'Could not find the specified Token'});
                }
            });
        } else{
            callback(400, {Error: "Missing Required field"})
        }
    };

    // Verify if a given token id is valid for a given user
    handlers._tokens.verifyToken = (id, customerEmail, callback) => {
        // Lookup the token 
        db.read('tokens', id, (err, tokenData) => {
            
            if(!err && tokenData) {
                // console.log(tokenData.expires, Date.now());
                // Check that the token is for a given user and has not expired
                if(tokenData.customerEmail == customerEmail && tokenData.expires > Date.now()){

                    callback(true);
                } else {
                    callback(false);
                }
            } else {
                callback(false)
            }
        });
    };

        //Menu handler
        handlers.menu = (data, callback) => {
            //Callback a http status code, and a payload object
            let acceptableMethod = [
                'get'
            ];
    
            let {method, payload, header, trimmedPath : {path}, queryString  } = data;
            if(acceptableMethod.includes(method)) {
                handlers._menu[method](data, callback);
            } else{
                callback(405)
            }
            
        }

    // Container for all menu methods
    handlers._menu = {};
    // Menu - get
    // Required data: token, customerEmail
    // Optional data: none
    handlers._menu.get = (data, callback) =>{
        let {headers : {token}, payload : {customerEmail}} = data;
        customerEmail = helpers.validateData(customerEmail, 'email');
        token = helpers.validateData(token, 'string', 20) ? helpers.validateData(token, 'string') :false;
        if(customerEmail){
            // Verify that the user Token is still valid
            handlers._tokens.verifyToken(token, customerEmail, (tokenIsValid) => {
                if(tokenIsValid){
                    // get all the items in menu
                    let menuItems =  menu.getAll();
                    callback(200, menuItems);
                } else {
                    callback(403, {"Error" : "Invalid or No token in header"})
                }
            });

        } else{
            callback(400, {"Error" : "Missing required"});
        }
                
    }

   
    //Carts handler
    handlers.carts = (data, callback) => {
        //Callback a http status code, and a payload object
        let acceptableMethod = [
            'get',
            'post',
            'delete',
            'put'
        ];

        let {method, payload, header, trimmedPath : {path}, queryString  } = data;
        if(acceptableMethod.includes(method)) {
            handlers._carts[method](data, callback);
        } else{
            callback(403)
        }
        
    };


    handlers._carts = {};

    // Required - token, menuid, customerEmail
    // Optional - none
    // Carts - Post
    handlers._carts.post = (data, callback) => {
        // Validate that item to add to cart are valid 
        let {payload : {menuId, customerEmail}, headers: {token}} = data;
        menuId = helpers.validateData(menuId, 'array');
        token = helpers.validateData(token, 'string', 20);
        customerEmail = helpers.validateData(customerEmail, 'email');
        
        if(menuId && customerEmail) {
            // Validate that token for the current user
            handlers._tokens.verifyToken(token, customerEmail, (tokenIsValid) => {
                if(tokenIsValid) {
                    
                    // Items container for menuId
                    let items = [];
                    // Loop through to get all 
                    menuId.forEach(id => {
                        item = menu.find(id);
                        if(item !== undefined) {
                            items.push(item);
                        } else{
                            console.log(`Error: menuId ${id} does not exist in menu, hence jumping it`);
                        }
                    });

                    // Make sure item is gotten before creating cart
                    if(items.length > 0) {

                        // Add items to cart
                        carts.add(items, customerEmail, (err, cartData) => {
                            if(!err && cartData) {
                                callback(200, {"message" : cartData});
                            } else{
                                callback(403, {"Error" : "Error adding item to cart"});
                            }
                        });
                    } else{
                        callback(400, {"Error" : "Invalid menu id to add to cart"});
                    }

                } else{
                    callback(403, {"Error" : "Invalid or No token in header"});
                }
            });

        } else{
            callback(403, {"Error" : "MIssing or Invalid required fields"});
        }

    }


    // Required - token, customeremail
    // Optional - none
    // Carts - Post
    handlers._carts.get = (data, callback) => {
        // Validate customerEmail and Token
        let {queryString : {customeremail :customerEmail}, headers: {token}} = data;
        customerEmail = helpers.validateData(customerEmail, 'email');
        token = helpers.validateData(token, 'string') && token.length ? helpers.validateData(token, 'string') : false;
        
        if(customerEmail){
            // Make sure that token exist and does not expire
            handlers._tokens.verifyToken(token, customerEmail, (tokenIsValid) => {
                // Continue if token is valid
                if(tokenIsValid){
                    // Create cart id
                    let cartId = `cart-${customerEmail}`;
                    db.read('carts', cartId, (err, cartData) => {
                        if(!err && cartData){
                            callback(200, cartData);
                        }else{
                            callback(403, {"Error" : "Cannot read cart with cart id"+cartId});
                        }
                    });
                } else{
                    callback(400, {"Error" : "Cannot validate token"});
                }
            });
        }
    }
    // Required - token, menuid, customerEmail
    // Optional - none
    // Carts - Put
    handlers._carts.put = (data, callback) => {
        // Validate data
        let {payload : {customerEmail, itemid}, headers : {token} } = data;
        customerEmail = helpers.validateData(customerEmail, 'email');
        
        itemid = helpers.validateData(itemid, "number");
        token = helpers.validateData(token, 'string', 20);
        if(customerEmail && itemid){
            handlers._tokens.verifyToken(token, customerEmail, (tokenIsValid) => {
                if(tokenIsValid) {
                    // remove item for each of the menu id
                        carts.remove(itemid, customerEmail, (err, msg) => {
                            if(!err && msg) {
                                callback(200, {"Message" : "Item(s) was succefully removed"});

                            } else{
                                callback(400, {"Error" : `Error removing item with id ${itemid}, item may not be in cart`});                            }
                        });

                } else{
                    callback(403, {"Error" : "Invalid or Unknown token in Header"});
                }
            });
        } else{
            callback(400, {"Error" : "Missing required fields"});
        }
    }


    // Required - token, customerEmail
    // Optional - none
    // Carts - Delete
    handlers._carts.delete = (data, callback) => {
        // Validate data
        let {payload : {customerEmail}, headers : {token} } = data;
        customerEmail = helpers.validateData(customerEmail, 'email');
        token = helpers.validateData(token, 'string', 20);
        

        if(customerEmail && token) {
            // Validate token
            handlers._tokens.verifyToken(token, customerEmail, (tokenIsValid) => {
                if(tokenIsValid) {
                    // Check if cart exist
                    db.list('carts', (err, cartNames)=>{
                        if(!err && cartNames) {
                            // Create cart name to find 
                            let cartName = `cart-${customerEmail}`;
                            if(cartNames.includes(cartName)){
                                // Delete the cart if it exists
                                db.delete('carts', cartName, (msg, err) => {
                                    if(!err && msg){
                                        callback(200, {"Message" : "Cart successfully deleted"});
                                    } else{
                                        callback(400, {"Error" :`Error deleting this cart ${customerEmail}, check permissions to this file`});
                                    }
                                });

                            } else{
                                callback(400, {"Message" : "Cart not find for this user, hence no cart was deleted"});
                            }
                        } else{
                            callback(400, "Error reading carts directory");
                        }
                    });
                } else{
                    callback(403, {"Error" : "Could not validate token"})
                }
            });
        }
        
    }

    //Order submethods handler
    handlers.order = (data, callback) => {
        //Callback a http status code, and a payload object
        let acceptableMethod = [
            'get',
            'post',
            'delete'
        ];

        let {method, payload, header, trimmedPath : {path}, queryString  } = data;
        if(acceptableMethod.includes(method)) {
            handlers._order[method](data, callback);
        } else{
            callback(403)
        }
        
    };

    //Order submethods handler
    handlers._order = {}

    //Order - Post
    //Required Fields: - card_number, card_exp_month, card_exp_year, card_cvc, token, customerEmail
    //Optional: None 
    handlers._order.post = (data, callback) => {
        // Validate data 
        let{payload : {card_number, card_exp_month, card_exp_year, card_cvc, customerEmail}, headers : {token}} = data; 
        card_number = helpers.validateData(card_number, 'string') && card_number.trim().length > 0 ? helpers.validateData(card_number, 'string') : false;
        card_exp_month = helpers.validateData(card_exp_month, 'string') && card_number.trim().length > 0 ? helpers.validateData(card_exp_month, 'string') : false;
        card_exp_year = helpers.validateData(card_exp_year, 'string') && card_number.trim().length > 0 ? helpers.validateData(card_exp_year, 'string') : false;
        card_cvc = helpers.validateData(card_cvc, 'string') && card_number.trim().length > 0 ? helpers.validateData(card_cvc, 'string') : false;
        customerEmail = helpers.validateData(customerEmail, 'email');

        token = helpers.validateData(token, 'string', 20);

        if(card_number && card_exp_month && card_exp_year && card_cvc && customerEmail) {
            // Validate the token 
            handlers._tokens.verifyToken(token, customerEmail, (tokenIsValid) => {
                if(tokenIsValid){
                    // Get cart item to send out to order
                    carts.getAll(customerEmail, (err, cartData) => {
                        if(!err && cartData){
                            // Create Payment Details Data
                            let paymentDetailsData = {
                                card_number,
                                card_exp_month,
                                card_exp_year,
                                card_cvc
                            };
                            order.makeAnOrder(customerEmail, paymentDetailsData, cartData, (err, msg) => {
                                if(!err && msg){
                                    callback(200, {"Message" : msg });
                                } else{
                                    callback(403, {"Error" : err});
                                }
                            });
                        } else {
                            callback(404, {"Error" : err} )
                        }
                    });
                } else{
                    callback(403, {"Error" : "Cannot validate token"})
                }
            });
        } else{
            callback(403, {"Error" : "Invalid payload"})
        }
    };

    //Order - Get
    //Required Fields: - id, token, customerEmail
    //Optional: None 
    handlers._order.get = (data, callback) => {
        // Validate data
        let {headers : {token}, payload: {customerEmail}, queryString: {id}} = data;
        token = helpers.validateData(token, 'string', 20);
        customerEmail = helpers.validateData(customerEmail, 'email');
        id = helpers.validateData(id, 'string');
        if(customerEmail && id){
            handlers._tokens.verifyToken(token, customerEmail, (tokenIsValid) =>{
                // COntinue if token is valid else return error
                if(tokenIsValid){
                    let orderId = `order-${id}`;
                    order.getOrder(orderId, (err, orderData) => {
                        if(!err && orderData){
                            callback(200, {"Order" : orderData});
                        } else {
                            callback(403, {"Error" : "error getting order with id"})
                        }
                    });
                } else{
                    callback(400, {"Error": "Token validation failed"});
                }
            })
        } else{
            callback(403, {"Error": "Missing required fields"});
        }
    };

    //Order - Delete
    //Required Fields: - id, token, customerEmail
    //Optional: None 
    handlers._order.delete = (data, callback) => {
        // Validate data
        let {headers : {token}, payload: {customerEmail}, queryString: {id}} = data;
        token = helpers.validateData(token, 'string', 20);
        customerEmail = helpers.validateData(customerEmail, 'email');
        id = helpers.validateData(id, 'string');
        if(customerEmail && id){
            handlers._tokens.verifyToken(token, customerEmail, (tokenIsValid) =>{
                // COntinue if token is valid else return error
                if(tokenIsValid){
                    let orderId = `order-${id}`;
                    db.delete('orders', orderId, (msg, err) => {
                        if(!err && msg){
                            callback(200, {"Message" : "Order deleted successfully"});
                        } else{
                            callback(400, {"Error" : "Could not delete order"})
                        }
                    });
                } else{
                    callback(400, {"Error": "Token validation failed"});
                }
            })
        } else{
            callback(403, {"Error": "Missing required fields"});
        }
    }


    //Not found Handler
    handlers.notFound = (data, callback) => {
        callback(404);
    };

    //Export the handler
    module.exports = handlers;