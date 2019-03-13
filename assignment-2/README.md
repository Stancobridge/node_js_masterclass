# Node JS Master Class [![N|Solid](https://s3.amazonaws.com/thinkific-import/116598/cYiInJ14QTexS1zdpeTV_logo5.png)](https://pirple.thinkific.com)
## Assignment #2 
You are building the API for a pizza-delivery company. Don't worry about a frontend, just build the API. Here's the spec from your project manager: 

1. New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.

2. Users can log in and log out by creating or destroying a token.

3. When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system). 

4. A logged-in user should be able to fill a shopping cart with menu items

5. A logged-in user should be able to create an order. You should integrate with the Sandbox of Stripe.com to accept their payment. Note: Use the stripe sandbox for your testing. Follow this link and click on the "tokens" tab to see the fake tokens you can use server-side to confirm the integration is working: https://stripe.com/docs/testing#cards

6. When an order is placed, you should email the user a receipt. You should integrate with the sandbox of Mailgun.com for this. Note: Every Mailgun account comes with a sandbox email account domain (whatever@sandbox123.mailgun.org) that you can send from by default. So, there's no need to setup any DNS for your domain for this task https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account

This is an open-ended assignment. You may take any direction you'd like to go with it, as long as your project includes the requirements. It can include anything else you wish as well. 


### Installation

download and install nodejs from [https://nodejs.org](https://nodejs.org)
```sh
clone this repository
cd to the cloned folder and open it terminal (linux and MAC) or cmd (Windows)
run the code below command
$ NODE_DEBUG=server node index.js
```
To use this api with ease, kindly download and install postman [https://www.getpostman.com](https://www.getpostman.com)

### Users
#### To Create a user you have to send post request to /users
```
$ POST localhost:5000/users
```
##### Required Fields: 
as payload => customerName (string), customerEmail (string), password (string), tosAgreement (string), customerAddress (string)

#### Read user 
Required fields => customerEmail (as QueryString) 
Required headers => `token` header for authentication. 
```
$  GET localhost:5000/users?id=:email
```

#### Update user details 
Required fields => customerEmail (string)
Optional => customerName, customerAddress, password (at least one must be specified)
Required headers => `token` header for authentication. 
```
$  PUT localhost:5000/users
```

#### Delete user 
Required fields => customerEmail (as QueryString) 
Required headers => `token` header for authentication. 
```
$  DELETE localhost:5000/users
```

### Token Routes
#### Create A token 
Required fields => customerEmail (string) and password (string)
```
$  POST localhost:5000/token
```

#### Extend A token Expiration time 
Required fields => id (string), extend (boolean)
```
$  PUT localhost:5000/token
```

#### Get A token Expiration time 
Required fields => id (as QueryString) 
```
$  GET localhost:5000/token?id=:token
```

#### Delete A token  
Required fields => id (as QueryString) 
```
$  DELETE localhost:5000/token?id=:token
```

### Menu (You can only get menu)
Required fields => customerEmail (string)
Required headers => `token` header for authentication. 
```
$  GET localhost:5000/menu
```

### Create Routes

#### Add items to cart 
Required fields =>  menuid (array of menu id), customerEmail(string)
Required headers => `token` header for authentication.
To increase item quantity send `post` request again with array of items id of the item you want increase their quantity, any new id will be added and quantity of the new id will be one
```
$  POST localhost:5000/carts
```

### Remove a single item from Cart
Required fields => customerEmail (string), itemid (array of menu id)
Required headers => `token` header for authentication. 
```
$  PUT localhost:5000/carts
```

### Get Cart Items
Required fields => customeremail (string)
Required headers => `token` header for authentication. 
```
$  GET localhost:5000/carts?customeremail=:customeremail
```

### Delete Cart Items
Required fields => customeremail (string)
Required headers => `token` header for authentication. 
```
$  DELETE localhost:5000/carts?customeremail=:customeremail
```

### Order Routes

#### Make Order
Required fields => card_number (number), card_exp_month (number), card_exp_year (number), card_cvc (number), customerEmail (number)
Required headers => `token` header for authentication.
```
$  POST localhost:5000/order
```

#### Get ordeer
Required fields => id (as Querystring), customerEmail (string)
Required headers => `token` header for authentication.
```
$  GET localhost:5000/ordder?id=:id
```

#### Delete orders 
Required fields => id (as Querystring), customerEmail (string)
Required headers => `token` header for authentication.
```
$  GET localhost:5000/ordder?id=:id
```

