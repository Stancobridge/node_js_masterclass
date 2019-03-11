/**
 * Create and export configurable variables
 * 
 */

 //Container for all environments
 const environments = {};

//Staging object
environments.stagging = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'stagging',
    'hashSecrete' : 'thisIsaSecrete',
    'maxChecks' : 5,
    'stripe' : {
        'publishablekey' : 'pk_test_gWlZUhm5cSluCZQD2k68EkDB',
        'secreteKey' : 'sk_test_JvrpenFjjHhn6B8ZHru2Vv6G'
    },
    'mailgun' : {
        'domain' : 'sandbox0f738c6817534b80ada78828c1ec5177.mailgun.org',
        'apiKey' : 'a569975203f9db65d93dd11cdd0a77b0-7caa9475-906b2f93'
      }
};

//Production object
environments.production = {
    'httpPort' : 8000,
    'httpsPort' : 8001,
    'envName' : 'production',
    'hashSecrete' : 'thisIsalsoASecrete',
    'maxChecks' : 5,
    'twilio' : {
        'accountSid' : '',
        'authToken' : '',
        'fromPhone' : ''
      }
};

//Determine which environment was apassed as command-line argument
let currentEnvironment = typeof process.env.NODE_ENV == 'string' ? process.env.NODE_ENV.toLowerCase() : "" ;

//Check if the environment passed is defined in the environments object above, if not default to string
currentEnvironment = environments.hasOwnProperty(currentEnvironment) ? environments[currentEnvironment] : environments.stagging ;

//Export the Module
module.exports = currentEnvironment;