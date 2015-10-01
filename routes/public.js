var express   = require('express'),
    mongoskin = require('mongoskin'),
    router    = express.Router(),
    db = mongoskin.db((process.env.MONGOLAB_URI || 'mongodb://localhost:27017/test'), {safe: true});

    // Thanks to http://webapplog.com/tutorial-node-js-and-mongodb-json-rest-api-server-with-mongoskin-and-express-js/
    // for the cool help

  router.param('collectionName', function(req, res, next, collectionName) {
    req.collection = db.collection(collectionName);
    next();
  });

  router.route('/:collectionName')

  // GET /collections/:collectionName
    .get(function(req, res, next) {
      req.collection.find({},{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
        if (e) { return next(e); }
        res.send(results);
      });
    })

  // POST /collections/:collectionName
    .post(function(req, res, next) {
      req.collection.insert(req.body, {}, function(e, results, next){
        if (e) { return next(e); }
        res.send(results.ops[0]);
      });
    });

  router.route('/:collectionName/:id')

    // GET /collections/:collectionName/:id
    .get(function(req, res, next) {
      req.collection.findOne({_id: req.collection.id(req.params.id)}, function(e, result){
        if (e) { return next(e); }
        res.send(result);
      });
    })

    // PUT /collections/:collectionName/:id
    .put(function(req, res) {
      delete req.body._id; //<-- backbone sends the _id in the payload, but mongo doesn't wan it in the $set (--@masondesu)
      req.collection.update({_id: req.collection.id(req.params.id)}, {$set:req.body}, {safe:true, multi:false}, function(e, result){
        req.collection.findOne({_id: req.collection.id(req.params.id)}, function(e, result){
          if (e) { return next(e); }
          res.send(result);
        });
      });
    })

    // DELETE /collections/:collectionName
    .delete(function(req, res, next) {
      req.collection.remove({_id: req.collection.id(req.params.id)}, function(e, result){
        if (e) { return next(e); }
        res.send((result===1)?{msg:'success'}:{msg:'error'});
      });
    });

  module.exports = router;
