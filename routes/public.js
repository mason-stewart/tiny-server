var express   = require('express'),
    router    = express.Router(),
    db = require('./../db'),
    ObjectId = require('mongodb').ObjectID

    // Thanks to http://webapplog.com/tutorial-node-js-and-mongodb-json-rest-api-server-with-mongoskin-and-express-js/
    // for the cool help

  router.param('collectionName', function(req, res, next, collectionName) {
    req.collection = db.get().collection(collectionName);
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
      req.collection.insert(req.body, {}, function(e, results){
        if (e) { return next(e); }
        res.send(results.ops[0]);
      });
    });

  router.route('/:collectionName/:id')

    // GET /collections/:collectionName/:id
    .get(function(req, res, next) {
      req.collection.find({"_id": ObjectId(req.params.id)}).toArray(function(e, result){
        if (e) { return next(e); }
        res.send(result[0]);
      });
    })

    // PUT /collections/:collectionName/:id
    .put(function(req, res, next) {
      delete req.body._id; //<-- backbone sends the _id in the payload, but mongo doesn't wan it in the $set (--@masondesu)
      req.collection.update({"_id": ObjectId(req.params.id)}, {$set:req.body});
      req.collection.find({"_id": ObjectId(req.params.id)}).toArray(function(e, result){
        if (e) { return next(e); }
        res.send(result[0]);
      });
    })

    // DELETE /collections/:collectionName/:id
    .delete(function(req, res, next) {
      var result = req.collection.remove({_id: ObjectId(req.params.id)});
      res.send(result["Error"]?{"msg":"error"}:{"msg":"success"});
    });

  module.exports = router;
