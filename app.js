var express = require('express')
  , rtIndex  = require('./routes')
  , rtPublic  = require('./routes/public')
  , rtSecure  = require('./routes/secure')
  , morgan  = require('morgan')
  , favicon = require('serve-favicon')
  , methodOverride = require('method-override')
  , errorhandler = require('errorhandler')
  , http    = require('http')
  , path    = require('path')
  , bodyParser = require('body-parser')

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
    else { next(); }
};

// Configuration
  app.use(allowCrossDomain);
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(favicon(__dirname + '/public/favicon.ico'));
  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));

// Dev-Specific Configuration
var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
  app.use(errorhandler());
}

// Routes
//  |-- Index
app.get('/', rtIndex.index);
//  |-- Insecure API
app.use('/collections', rtPublic);
//  |-- "Secured" API
app.use('/secure/collections', rtSecure);

// Light It Up!
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
