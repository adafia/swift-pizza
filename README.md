# swift-pizza
Pizza Delivery App

## Features
1. New users can be created, their information can be edited, and they can be deleted. 
   Sample user object:
```
        {
            "firstName": "string",
            "lastName": "string",
            "phone": "string",
            "email": "example@email.com",
            "address": "string",
            "password": "hashedPassword",
            "tosAgreement": true 
        }
```

2. Users can log in and log out by creating or destroying a token.

3. An admin can update a users admin status and create a menu item.
   Sample menu item object:
```
        {
                "name": "Hawaiian",
                "ingredients": ["hand-torn ham", "pineapple"],
                "image": "https://www.thespruceeats.com/thmb/N9TPXNal0e0AhNkvd2qJ457PHgE=/960x0/filters:no_upscale():max_bytes(150000):strip_icc()/IMG_4618fhor-a98bebf4c7e743a8bbfd6071b5dafc12.jpg",
                "price": 5
        }
```

3. A logged-in user can GET all the possible menu items (these items can be hardcoded into the system).

4. A logged-in user can fill a shopping cart with menu items

5. A logged-in user should be able to create an order. 
``` @Todo
        Integration with the Stripe.com Sandbox to enable user their payment. Note: Use the stripe sandbox for your testing. Follow this link and click on the "tokens" tab to see the fake tokens you can use server-side to confirm the integration is working: https://stripe.com/docs/testing#cards
```

6. When an order is placed, the user recieves an email which contains thier receipt.
```@Todo
        Integration with Mailgun.com sandbox. Note: Every Mailgun account comes with a sandbox email account domain (whatever@sandbox123.mailgun.org) that you can send from by default. So, there's no need to setup any DNS for your domain for this task https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account
```

## Set up SSL certificates
1. create an `https` directory in the root of the `app` directory.

2. navigate into the `https` directory in your command line / terminal and run the following command:
     `openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem`
