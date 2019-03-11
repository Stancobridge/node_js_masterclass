const helpers = require('./helpers')
const querystring = require('querystring');
const https = require('https');
const config = require('./config');


const mailgun = {};
mailgun.sendOrderReceipt = (order, callback) => {
    order = helpers.validateData(order, 'array');
    if(order){
        let customerEmail = '';
        let paymentId = '';
        let totalPrice = ''
        orderItems = '';
        order.forEach(item => {
            if(item.paymentId == undefined){
                let {item_name, item_price, size, count} = item;
                orderItems += `
                    <tr>
                        <td>${item_name}</td>
                        <td>$${item_price} </td>
                        <td>${size} </td>
                        <td>${count}</td>
                    </tr>
               
                `;
            } else{
                customerEmail = item.customerEmail;
                paymentId = item.paymentId;
                totalPrice = item.totalPrice;
            }
        });



        let messageTemplate = `
            <style>
                table, th, td, tr{
                    border-collapse: collapse
                }
                .message-container{
                    border: 1px solid gray;
                    box-shadow: 3px 3px 3px gray;
                    font-family:  -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    font-size: 14px;
                    color: #696969
                }
                h4{
                    background-color: #0b9e6a;
                    color: white;
                    padding: 10px;
                    margin-bottom: 10px;
                }

                h5{
                    background-color: #71d4b1;
                    color: white;
                    padding: 10px;
                    margin-bottom: 10px;
                }
            </style>
            <div class="message-container">
                <h4>Thanks for your Purchase, your order went successfully</h4>

                <h5>Order Details for ${paymentId} <h/5> 

                Order Items: 
                <hr>

                <table border="1" cellspacing="0" cellpadding="8">
                    <thead>
                        <tr>
                            <td>Pizza Name </td>
                            <td>Pizza Prize </td>
                            <td>Size </td>
                            <td>Quantity</td>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderItems}

                        
                    </tbody>
                
                </table>
                <h5>
                    Total Price : ${totalPrice}
                </h5>
        </div>

        `;

        // Construct Request Data
        let requestData = {
            'from' : 'OsMaxin Pizza Receipt <postmaster@sandbox0f738c6817534b80ada78828c1ec5177.mailgun.org>',
            'to' : customerEmail,
            'subject' : `Pizza order Receipt ${paymentId}` ,
            'text' : 'Order Successfull',
            'html' : "<html>"+messageTemplate+"</html>"
        };

        // Convert request data to Query String
        let requestDataString = querystring.stringify(requestData);

        // Create Request Options
        let requestOptions = {
            'protocol' : 'https:',
            'hostname' : 'api.mailgun.net',
            'method' : 'POST',
            'path' : '/v3/' + config.mailgun.domain + '/messages',
            'auth': 'api:' + config.mailgun.apiKey,
            'headers' : {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(requestDataString)
            }
        
    };

      // instantiate the request object
    let req = https.request(requestOptions, (res) => {
        
        // Set the encoding formart for the response data
        let responseData = {};
        res.setEncoding('utf8');
        res.on('data', (data) => {
            responseData = data;
        });

        // Grab the status of this request
        let status = res.statusCode;

        // Validate that request went successfull
        if (status == 200 || status == 201) {
            callback(false, responseData);
        } else {
            callback('Error Mailgun returned this status code ' + status);
        }
    });
    // bind to the error event so it does not get thrown
    req.on('error', (err) => {
        callback(err);
    });
    req.write(requestDataString);
    req.end();
        
    } else {
        
        callback("Error: Cannot validate order")
    }
}

module.exports = mailgun;