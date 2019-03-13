const querystring = require('querystring');
const config = require('./config');
const https = require('https');
const helpers = require('./helpers');

stripe = {};

stripe.createPaymentToken = (paymentDetailsData, callback) => {

    let { card_number, card_exp_month, card_exp_year, card_cvc} = paymentDetailsData;
        // Create request Data
        const payload = {
            'card[number]' : card_number,
            'card[exp_month]' : card_exp_month,
            'card[exp_year]' : card_exp_year,
            'card[cvc]' : card_cvc
        };

        let payloadString = querystring.stringify(payload);

        // Create the request Details
        let requestDetails = {
            'protocol' : 'https:',
            'hostname' : 'api.stripe.com',
            'method' : 'POST',
            'path' : '/v1/tokens',
            'auth': config.stripe.publishablekey + ':' +config.stripe.secreteKey ,
            'headers' : {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(payloadString)
            }
        };

        let req = https.request(requestDetails, (res) => {
            // Set encoding formart for the response data
            res.setEncoding('utf8');
            let tokenObject = {}; 
            res.on('data', (data) => {
                tokenObject = helpers.parseJsonToObject(data);
                if (tokenObject.id) {
                    callback(false, tokenObject.id);
                } else {
                    callback('Stripe token generating seems not to go through');
                }
            });
            
            
        });


        // Bind to the Error Event so it doesn't get thrown
        req.on('error', (e) => {
            callback(e);
        });

        // Add the payload 
        req.write(payloadString);

        req.end();
    
  
}

stripe.makePayment = (stripeToken, amount, callback) => {
    // Construct payment data
    let paymentData = {
        source: stripeToken,
        amount: amount,
        currency: 'USD',
        description: 'Thanks for purchasing our Pizza, Enjoy and return'
    };
    let paymentDataString = querystring.stringify(paymentData);


     // construct the request option
    let requestOptions = {
        'protocol' : 'https:',
        'hostname' : 'api.stripe.com',
        'method' : 'POST',
        'path' : '/v1/charges',
        'auth': config.stripe.secreteKey + ' : ' + config.stripe.publishablekey,
        'headers' : {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(paymentDataString)
        } 
    };

    // instantiate the request object
    let req = https.request(requestOptions, (res) => {
        // Set encoding formart for the response data
        res.setEncoding('utf8');
        let paymentObject = {};
        res.on('data', (data) => {
            paymentObject = JSON.parse(data);
            console.log(paymentObject);
            if (paymentObject.id) {
                callback(false, paymentObject.id);
            } else {
                callback('Stripe payment seems not to go through');
            }
        });
    });
    // bind to the error event so it does not get thrown
    req.on('error', (err) => {
        callback(err);
    });
    req.write(paymentDataString);
    req.end();
};

module.exports = stripe;
