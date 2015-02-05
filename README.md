### Tiny Server
Nothing to see here, just a little Express app with a dummy-simple CRUD API using Mongoskin. CORS traffic from any source is allowed to make it easy to POST/GET/PUT/DELETE JSON payloads from other apps running locally. You've been warned!

Just meant for lightweight local dev and messing around. Obviously not fit for prod :D

#### Dependencies
Run `npm install` and `bower update` to get your dependencies ready. `./node_modules` is in the `.gitignore`, Yeoman-style :)

#### Usage
Run `grunt` to fire it up, and make sure you have Mongo installed (`brew install mongo`) and that you've started the Mongo dæmon with `mongod`. Enjoy! 

#### "Secure" Access

#####:bangbang: This is JUST FOR FUN & LEARNING. This is NOT FOR PRODUCTION USE. This is NOT SECURE. :bangbang:

Identical resources are available at `/collections` AND `/secure/collections`. POST/PUT/DELETE actions for `/secure` resources require an api key, which can be retrieved with a post call to `/secure/collections/users`. The post body should contain a JSON object with "username" and "email" values and will return a JSON object with an "apiKey" value. This can be passed as query string "api_key" for access to restricted `/secure` resources. 

#### Deploy
To deploy to Heroku, use the button below. You will need to have a credit card on your account in order to set up MongoLab, but it is free and will not be charged.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)
