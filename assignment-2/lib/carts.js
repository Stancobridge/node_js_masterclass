/**
 * This file contains every function helper for carts
 */

 //Dependencies
 const db = require('./database');
 const helpers = require('./helpers');
 const menu = require('./menu');


// Cart module container
const carts = {};

// Adds item into cart
carts.add = (items, custormerEmail, callback) => {
    // Validate items to be object
    items = helpers.validateData(items, 'array');
    
    if(items){
        // Create ID for the ne cart
        let cartId = `cart-${custormerEmail}`;

        // Make sure that user don't already have cart to avoid creating new cart for user
        db.read('carts', cartId, (err, cartData) => {
            
            if(!err && cartData) {
                // Get id(s) of all the cartData
                let cartDataId = [];
                cartData.forEach((it,i) => {
                    cartDataId.push(it.id);
                })
                // Update cart if it already exist inn the cart


                // New Cart Items holder
                let newCartItems = [];
                items.forEach((item, ind) => {
                    let updateDate = {};
                    // let index = 0;
                    let isInCart = cartData.find((cart, i) => {
                        index = i;
                        return item.id == cart.id
                    });

                    if(cartDataId.includes(item.id)){
                        let ind = cartDataId.indexOf(item.id);
                        cartData[ind].count += 1;
                    } else {
                        item.count = 1;
                        if(menu.find(item.id)){
                            cartData.push(item);
                        }
                    }


                });
                
                // Update the cart
                db.update('carts', cartId, cartData, (msg, err) => {
                    if(!err && msg) {
                        callback(false, 'Item added successfully');
                    } else{
                        callback('Error: Cannot update Cart');
                    }
                });
                
            } else{
                items.forEach((_, index) => {
                    items[index].count = 1;
                });
                // Create new cart if no cart exists for the user
                db.create('carts', cartId, items, (msg, err) => {
                    if(!err && msg) {
                        callback(false, 'Item added successfully');
                    } else{
                        callback('Error: Cannot create file');
                    }
                } );
            }
        });
        


    }
};


// Remove items from cart
carts.remove = (menuId, custormerEmail, callback) => {

    let cartId = `cart-${custormerEmail}`;

    // Find the cart to remove item from
    carts.find(cartId, (err, cartData) => {

        if(!err && cartData) {
            let updateTheCart = false;
            // Find the menu item to remove
            cartData.forEach((cart, i) => {
                if(cart.id == menuId) {
                    // Remove the item from the cart
                    cartData.splice(i, 1);
                    updateTheCart = true;
                }
            });

            // If item is in cart remove it
            if(updateTheCart) {
                db.update('carts', cartId, cartData, (msg, err)=>{
                    
                    if(!err && msg) {
                        callback(false, "Item succesfully removed");
                    } else{
                        callback("Error Updating cart with new data");
                    }
                });
            } else{
                callback("Error menuid not found in this cart, hence no item was removed")
            }
        } else{
            callback(err)
        }
    });
};

// Get all item in cart
carts.getAll = (customerEmail, callback) => {
    let cartId = `cart-${customerEmail}`;
        db.read('carts', cartId, (err, cartData) => {
            if(!err && cartData){
                callback(false, cartData);
            }else{
                callback({"Error" : "Cannot read cart with cart id "+cartId});
            }
        });
}

// Find cart
carts.find = (cartId, callback) => {
    db.read('carts', cartId, (err, cartData) => {
        if(!err && cartData) {
            callback(false, cartData);
        } else{
            callback('Error: cannot read cartid, cart seems not to  exist');
        }
    });
};

// Export the Carts Module
module.exports = carts
