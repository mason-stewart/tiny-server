// require necessary modules
var express = require('express')
  //, mongoskin = require('mongoskin')
  , routes = require('./routes')
  , public = require('./routes/public')
  , secure = require('./routes/secure')
  , morgan = require('morgan')
  , favicon = require('serve-favicon')
  , methodOverride = require('method-override')
  , errorhandler = require('errorhandler')
  , http = require('http')
  , path = require('path')
  , bodyParser = require('body-parser')
  // , db = mongoskin.db((process.env.MONGOLAB_URI || 'localhost:27017/test'), {safe:true});
  //, db = mongoskin.db('mongodb://notmason:not*this-password0@ds031561.mongolab.com:31561/safetypizza', {safe:true});

// get an instance of express
var app = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

// configure it
//app.configure(function(){
  app.use(allowCrossDomain);
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.use(express.favicon());
  app.use(favicon(__dirname + '/public/favicon.ico'));
  //app.use(express.logger('dev'));
  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(methodOverride());
  //app.use(express.methodOverride());
  //app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
//});

// dev config
//app.configure('development', function(){
//  app.use(express.errorHandler());
//});
var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
  app.use(errorhandler());
}

// PLEASE NOTE this turns on CORS for everything, everywhere!
// Almost certainly not what you want to do in production.
// app.all('/*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });

// index route
app.get('/', routes.index);

// public collections route
app.use('/collections', public);
// secure collections route
app.use('/secure/collections', secure);

/*
// Setup the collectionName param for requests
app.param('collectionName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName)
  return next()
})

// Helper Methods
var wordBank = ['veggie', 'ham', 'bacon', 'marinara', 'mushroom', 'extra', 'cheese', 'pineapple', 'easy-on', 'pepperoni', 'sausage', 'onion', 'lovers', 'supreme'];
var generateSafeKey = function(keyLength, callback) {
	var myKey = [];
	for (var i=0; i < keyLength; i++) {
		myKey.push(wordBank[Math.floor(Math.random() * wordBank.length)]);
	}
	myKey = myKey.join('-');
	db.collection('users').find({apiKey: myKey}, {_id:1}).toArray(function(e, result, next) {
		if (result.length === 0) {
			callback(myKey);
		} else {
			generateSafeKey(keyLength, callback);
		}
	});
}

var getUserFromKey = function(key, callback) {
	db.collection('users').find({apiKey: key}, {username:1}).toArray(function(e, result, next) {
		if (result.length !== 0) {
			callback(result[0].username)
		} else {
			callback(null)
		}
	})
}

// end Helper Methods

// API endpoints
// Thanks to http://webapplog.com/tutorial-node-js-and-mongodb-json-rest-api-server-with-mongoskin-and-express-js/
// for the cool help

// Catch the 'user' routes first to prevent dumping user data.
// GET /collections/users
app.get('/collections/users', function(req, res, next) {
	res.send(404);
});

// POST /collections/users
app.post('/collections/users', function(req, res, next) {
	var newUser = {};
	if (!req.body.username || !req.body.email) {
		res.send("Key requests must contain both a 'username' and an 'email' value. Please check your data and try again.\r\n");
	}
	generateSafeKey(4, function(safeKey) {
		newUser.username = req.body.username;
		newUser.email = req.body.email;
		newUser.apiKey = safeKey;
		db.collection('users').insert(newUser, {}, function(e, results) {
			if (e) { return next(e); }
			res.send(results[0]);
		});
	});
});

// GET /collections/:collectionName
app.get('/collections/:collectionName', function(req, res, next) {
  req.collection.find({},{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
    if (e) return next(e);
    res.send(results);
  })
})

// POST /collections/:collectionName
app.post('/collections/:collectionName', function(req, res, next) {
	if (!req.query.api_key) { res.send("Please resend with an API key!\r\n"); }
	getUserFromKey(req.query.api_key, function(userName) {
		if (!userName) { res.send("Invalid API Key!\r\n"); }
		console.log(userName);
		req.body.author = userName;
		req.collection.insert(req.body, {}, function(e, results){
    	if (e) return next(e);
    	res.send(results[0]);
  	})
	})
})


// GET /collections/:collectionName/:id
app.get('/collections/:collectionName/:id', function(req, res) {
  req.collection.find({_id: req.collection.id(req.params.id)}, function(e, results){
    if (e) return next(e)
    res.send(result[0])
  })
})

// PUT /collections/:collectionName/:id
app.put('/collections/:collectionName/:id', function(req, res) {
	if (!req.query.api_key) {
    res.send("You can't do that witout an API key!\r\n");
    return;
  }
  getUserFromKey(req.query.api_key, function(userName) {
    req.collection.find({ _id: req.collection.id(req.params.id) }, {author:1}).toArray(function(e, results) {
      if (!results[0] || results[0].author !== userName) {
        res.send("You don't have permission to alter someone else's data!\r\n");
        return;
      }
    delete req.body._id; // <-- backbone sends the _id in the payload, but mongo doesn't wan it in the $set
    req.collection.update({_id: req.collection.id(req.params.id)}, {$set:req.body}, {safe:true, multi:false}, function(e, result){
      res.send((result===1)? 200 : 404 )
    })
  })
 })
})

// DELETE /collections/:collectionName
app.del('/collections/:collectionName/:id', function(req, res) {
	if (!req.query.api_key) {
    res.send("You can't do that without an API key!\r\n");
    return;
  }
	getUserFromKey(req.query.api_key, function(userName) {
		req.collection.find({ _id: req.collection.id(req.params.id) }, {author:1}).toArray(function (e, results) {
      if (!results[0] || results[0].author !== userName) {
        res.send("You don't have permission to delete someone else's data!\r\n");
        return;
      }
      req.collection.remove({_id: req.collection.id(req.params.id)}, function(e, result){
        if (e) return next(e)
        res.send((result===1)?{msg:'success'}:{msg:'error'})
      })
    });
	});
})

// end API endpoints
*/
// run the server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
