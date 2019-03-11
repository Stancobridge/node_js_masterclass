    
    /**
     * Primary file for the API
     * 
     */

    //  Dependencies
    // const carts = require('./lib/carts');
    // [3,1,4].forEach(i => {
    //     carts.remove(i, 'soromgawide@gmail.com', (err, msg) => {
    //         if(!err && msg) {
    //             console.log('Removed');
    //         } else{

    //         }
    //     });
    // });
   
   
    const server = require('./lib/server');
    
    // Declare the app
    const app = {};

    // Declare the initialization function
    app.init = () => {
        // Start the server
        server.init();

    };


    // Initialize the app
    app.init();
    module.exports = app;