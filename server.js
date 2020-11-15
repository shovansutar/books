// var express = require('express'),
//     path = require('path'),
//     passport = require('passport'),
//     exphbs = require('express-handlebars'),
//     express = require('express'),
//     session = require('express-session'),
//     bodyParser = require('body-parser'),
//     morgan       = require('morgan'),
//     router = express.Router(),
//     mongoose = require('mongoose');

// var LocalStrategy = require('passport-local').Strategy;    
// var app = express();
// app.set('port', process.env.PORT || 3300);
// app.use(morgan('dev')); // log every request to the console

// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var cors = require('cors'); 
var port     = process.env.PORT || 3300;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var exphbs   = require('express-handlebars');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url,{ useNewUrlParser: true }); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public/', express.static('public'));
app.use(cors());

// set view engine
app.engine('handlebars', exphbs.create({
    defaultLayout: 'main',
    layoutsDir: 'views/layouts',
    partialsDir: ['views/partials']
}).engine);

app.set('view engine', 'handlebars');

// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
// for flash message
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('Server up: http://localhost:' + port);
//------------------------------------old-----------------------------------


// router.get('/login', function(req, res){
//     res.render('login');
// });

// app.post('/login',
//     passport.authenticate('local', { failureRedirect: '/login' }),
//     function (req, res) {
//         res.redirect('/');
//     });

// router.post('/login', function(req, res){
//     console.log('login - post');
//     passport.authenticate('local', {
//         successRedirect : '/profile',
//         failureRedirect : '/login'
//     });
// });

// router.get('/images/:image_id', image.index);
// app.use('/public/', express.static(path.join(__dirname, './public')));
    
// app.use(router);
// app.use(function (req, res, next) {
//     res.status(404).send("Sorry can't find that!")
// });
// app.listen(app.get('port'), function () {
//     console.log('Server up: http://localhost:' + app.get('port'));
// });