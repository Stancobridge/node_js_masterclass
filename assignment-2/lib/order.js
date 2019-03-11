
let stripe = require('./stripe');
let db = require('./database');
let mailgun = require('./mailgun');
order = {};

order.makeAnOrder = (customerEmail, paymentDetailsData, cartData, callback) => {
    // Get total price
    console.table(cartData);
    let totalPrice = cartData.reduce((carr, curr) => carr + (Number(curr.item_price).valueOf() * curr.count), 0)

    console.log(totalPrice);
    // Create Order Object
    // let transaction_id = helpers.createRandomString(12);
    // let orderData = {
    //     transaction_id,
    //     customerEmail,
    //     items : cartData,
    //     totalPrice,
    //     paymentDetailsData
    // }

    // "card_number": "4gdsjhgsdfdsa",
    // "card_exp_month": "4gdsjhgsdfdsa",
    // "card_exp_year": "4gdsjhgsdfdsa",
    // "card_cvc": "4gdsjhgsdfdsa"
    // Create Payment Details
    
    stripe.createPaymentToken(paymentDetailsData, (err, tokenId) => {
        if(!err){
            stripe.makePayment(tokenId, totalPrice, (err, paymentId) => {
                console.log(paymentId);
                if(!err && paymentId){
                    
                    // Add payment id to the cartData
                    cartData.push({paymentId, totalPrice, customerEmail });

                    // Create order Id
                    let orderId = `order-${paymentId}`;

                    // Create Order record for this purchase
                    db.create('orders', orderId, cartData, (msg, err) => {
                        if(!err && msg){
                            // Send reciept to user email if purchase went successful
                            mailgun.sendOrderReceipt(cartData, (err, msg) =>{
                                if(!err){
                                    callback(false, "Order Completed successfully");
                                }else{
                                    callback('Error sending email');
                                }
                            });
                        } else{
                            callback(err);
                        }
                    });

                } else{
                    callback("Error " +err)
                }
            });
        } else {
            callback(err);
        }
    });
  
};


order.getOrder = (orderId, callback) => {
    // Lookup Order for orderId
    db.read('orders', orderId, (err, orderData) => {
        if(!err && orderData){
            callback(false, orderData);
        } else {
            callback(err);
        }
    });
};

module.exports = order;