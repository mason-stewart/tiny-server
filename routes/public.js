var express   = require('express'),
    mongoskin = require('mongoskin'),
    router    = express.Router(),
    db = mongoskin.db('mongodb://notmason:not*this-password0@ds031561.mongolab.com:31561/safetypizza', {safe:true});


  router.param('collectionName', function(req, res, next, collectionName) {
    req.collection = db.collection(collectionName);
    next();
  });

  router.route('/:collectionName')
  // Setup the collectionName param for requests
    // .all(function(req, res, next) {
    //   req.collection = db.collection(req.params.collectionName);
    //   return next();
    // })

  // API endpoints
  // Thanks to http://webapplog.com/tutorial-node-js-and-mongodb-json-rest-api-server-with-mongoskin-and-express-js/
  // for the cool help

  // GET /collections/:collectionName
    .get(function(req, res) {
      req.collection.find({},{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
        if (e) return next(e)
        res.send(results)
      })
    })

  // POST /collections/:collectionName
    .post(function(req, res) {
      req.collection.insert(req.body, {}, function(e, results, next){
        if (e) return next(e)
        res.send(results[0])
      })
    });

  router.route('/:collectionName/:id')
    // .all(function(req, res, next) {
    //   req.collection = db.collection(req.params.collectionName);
    //   return next();
    // })
    // GET /collections/:collectionName/:id
    .get(function(req, res) {
      req.collection.findOne({_id: req.collection.id(req.params.id)}, function(e, result){
        if (e) return next(e)
        res.send(result)
      })
    })

    // PUT /collections/:collectionName/:id
    .put(function(req, res) {

      // backbone sends the _id in the payload, but mongo doesn't wan it in the $set
      delete req.body._id;

      req.collection.update({_id: req.collection.id(req.params.id)}, {$set:req.body}, {safe:true, multi:false}, function(e, result){
        res.send((result===1)? 200 : 404 )
      })
    })

    // DELETE /collections/:collectionName
    .delete(function(req, res) {
      req.collection.remove({_id: req.collection.id(req.params.id)}, function(e, result){
        if (e) return next(e)
        res.send((result===1)?{msg:'success'}:{msg:'error'})
      })
    })

  // end API endpoints

  module.exports = router;
