    
    /**
     * Primary file for the API
     * 
     */

    //  Dependencies   
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
