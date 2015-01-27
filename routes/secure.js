var express   = require('express'),
    mongoskin = require('mongoskin'),
    router    = express.Router(),
    db = mongoskin.db('mongodb://notmason:not*this-password0@ds031561.mongolab.com:31561/safetypizza', {safe:true});


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
};

var getUserFromKey = function(key, callback) {
  db.collection('users').find({apiKey: key}, {username:1}).toArray(function(e, result, next) {
    if (result.length !== 0) {
      callback(result[0].username);
    } else {
      callback(null);
    }
  });
};
// end Helper methods

// Routing
router.param('collectionName', function(req, res, next, collectionName) {
  req.collection = db.collection(collectionName);
  next();
});

// Catch the 'users' routes first to prevent dumping user data.
router.route('/users')
  // GET /collections/users (/dev/null)
  .get(function(req, res, next) { res.send(404); })

  // POST /collections/users
  .post(function(req, res, next) {
    var newUser = {};
    if (!req.body.username || !req.body.email) {
      res.send("Key requests must contain both a 'username' and an 'email' value. Please check your data and try again.\r\n");
    }
    generateSafeKey(3, function(safeKey) {
      newUser.username = req.body.username;
      newUser.email = req.body.email;
      newUser.apiKey = safeKey;
      db.collection('users').insert(newUser, {}, function(e, results) {
        if (e) { return next(e); }
        /**
         * "Pretty" API Key notification (optional)
         *
        var notifier = "Your API Key is '" + results[0].apiKey + "'!\r\n";
        notifier += "Make sure you write this in a safe place - you'll need it!\r\n";
        console.log(results[0]);
        res.send(notifier);
         */
        res.send(results[0]);
      });
    });
  });

router.route('/:collectionName')
  // GET /collections/:collectionName
  .get(function(req, res, next) {
    req.collection.find({},{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
      if (e) return next(e);
      res.send(results);
    });
  })

  // POST /collections/:collectionName
  .post(function(req, res, next) {
    if (!req.query.api_key) { res.send("Please resend with an API key!\r\n"); }
    getUserFromKey(req.query.api_key, function(userName) {
      if (!userName) { res.send("Invalid API Key!\r\n"); }
      console.log(userName);
      req.body.author = userName;
      req.collection.insert(req.body, {}, function(e, results){
        if (e) return next(e);
        res.send(results[0]);
      });
    });
  });


router.route('/:collectionName/:id')
  // GET /collections/:collectionName/:id
  .get(function(req, res) {
    req.collection.find({_id: req.collection.id(req.params.id)}, function(e, results){
      if (e) { return next(e); }
      res.send(result[0]);
    });
  })

  // PUT /collections/:collectionName/:id
  .put(function(req, res) {
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
        delete req.body._id; // <-- backbone sends the _id in the payload, but mongo doesn't wan it in the $set (-- @masondesu)
        req.collection.update({_id: req.collection.id(req.params.id)}, {$set:req.body}, {safe:true, multi:false}, function(e, result){
          res.send((result===1)? 200 : 404 );
        });
      });
    });
  })

  // DELETE /collections/:collectionName
  .delete(function(req, res) {
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
          if (e) { return next(e); }
          res.send((result===1)?{msg:'success'}:{msg:'error'});
        });
      });
    });
  });

// end Routing


module.exports = router;
