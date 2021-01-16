var editbook = require('../contoller/editbook');
var home = require('../contoller/home');
var api = require('../contoller/api');
var fs = require('fs'),
    multer = require('multer'),
    path = require('path');
const conf = require('../config/auth');
const jwt = require('jsonwebtoken');

var upload = multer({
    dest: path.join(__dirname, '../public/upload')
});
    
module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile', {
            user : req.user
        });
    });
    // Home SECTION =========================
    app.get('/api', api.index);
    app.get('/api/category', api.category);
    app.get('/api/book', api.bookAll);
    app.get('/api/bookSearch/:pattern', api.bookSearch);
    app.get('/api/book/:book_id', api.bookOne);
    app.post('/api/book', verifyToken, api.addBook);
    app.delete('/api/book/:book_id', verifyToken, api.remove);
    app.put('/api/book/:book_id', verifyToken, api.updateBook);
    app.post('/api/upload', verifyToken, upload.single('file-to-upload'), api.saveTempFile);

    app.get('/home', home.index);
    app.post('/home', home.search);

    app.get('/editbook', editbook.index);
    app.get('/editbook/:book_id', editbook.index);
    app.post('/newbook', upload.single('file-to-upload'), editbook.save);
    // ------------- auth --------------

    app.post('/api/register', api.register);
    app.post('/api/login', api.login);

    
    // // LOGOUT ==============================
    // app.get('/logout', function(req, res) {
    //     req.logout();
    //     res.redirect('/');
    // });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

//     // locally --------------------------------
//         // LOGIN ===============================
//         // show the login form
//         app.get('/login', function(req, res) {
//             res.render('login', { message: req.flash('loginMessage') });
//         });

//         // process the login form
//         app.post('/login', passport.authenticate('local-login', {
//             successRedirect : '/profile', // redirect to the secure profile section
//             failureRedirect : '/login', // redirect back to the signup page if there is an error
//             failureFlash : true // allow flash messages
//         }));

//         // SIGNUP =================================
//         // show the signup form
//         app.get('/signup', function(req, res) {
//             res.render('signup', { message: req.flash('signupMessage') });
//         });

//         // process the signup form
//         app.post('/signup', passport.authenticate('local-signup', {
//             successRedirect : '/profile', // redirect to the secure profile section
//             failureRedirect : '/signup', // redirect back to the signup page if there is an error
//             failureFlash : true // allow flash messages
//         }));

//     // facebook -------------------------------

//         // send to facebook to do the authentication
//         app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile', 'email'] }));

//         // handle the callback after facebook has authenticated the user
//         app.get('/auth/facebook/callback',
//             passport.authenticate('facebook', {
//                 successRedirect : '/profile',
//                 failureRedirect : '/'
//             }));

//     // twitter --------------------------------

//         // send to twitter to do the authentication
//         app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

//         // handle the callback after twitter has authenticated the user
//         app.get('/auth/twitter/callback',
//             passport.authenticate('twitter', {
//                 successRedirect : '/profile',
//                 failureRedirect : '/'
//             }));


//     // google ---------------------------------

//         // send to google to do the authentication
//         app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

//         // the callback after google has authenticated the user
//         app.get('/auth/google/callback',
//             passport.authenticate('google', {
//                 successRedirect : '/profile',
//                 failureRedirect : '/'
//             }));

// // =============================================================================
// // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// // =============================================================================

//     // locally --------------------------------
//         app.get('/connect/local', function(req, res) {
//             res.render('connect-local', { message: req.flash('loginMessage') });
//         });
//         app.post('/connect/local', passport.authenticate('local-signup', {
//             successRedirect : '/profile', // redirect to the secure profile section
//             failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
//             failureFlash : true // allow flash messages
//         }));

//     // facebook -------------------------------

//         // send to facebook to do the authentication
//         app.get('/connect/facebook', passport.authorize('facebook', { scope : ['public_profile', 'email'] }));

//         // handle the callback after facebook has authorized the user
//         app.get('/connect/facebook/callback',
//             passport.authorize('facebook', {
//                 successRedirect : '/profile',
//                 failureRedirect : '/'
//             }));

//     // twitter --------------------------------

//         // send to twitter to do the authentication
//         app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

//         // handle the callback after twitter has authorized the user
//         app.get('/connect/twitter/callback',
//             passport.authorize('twitter', {
//                 successRedirect : '/profile',
//                 failureRedirect : '/'
//             }));


//     // google ---------------------------------

//         // send to google to do the authentication
//         app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

//         // the callback after google has authorized the user
//         app.get('/connect/google/callback',
//             passport.authorize('google', {
//                 successRedirect : '/profile',
//                 failureRedirect : '/'
//             }));

// // =============================================================================
// // UNLINK ACCOUNTS =============================================================
// // =============================================================================
// // used to unlink accounts. for social accounts, just remove the token
// // for local account, remove email and password
// // user account will stay active in case they want to reconnect in the future

//     // local -----------------------------------
//     app.get('/unlink/local', isLoggedIn, function(req, res) {
//         var user            = req.user;
//         user.local.email    = undefined;
//         user.local.password = undefined;
//         user.save(function(err) {
//             res.redirect('/profile');
//         });
//     });

//     // facebook -------------------------------
//     app.get('/unlink/facebook', isLoggedIn, function(req, res) {
//         var user            = req.user;
//         user.facebook.token = undefined;
//         user.save(function(err) {
//             res.redirect('/profile');
//         });
//     });

//     // twitter --------------------------------
//     app.get('/unlink/twitter', isLoggedIn, function(req, res) {
//         var user           = req.user;
//         user.twitter.token = undefined;
//         user.save(function(err) {
//             res.redirect('/profile');
//         });
//     });

//     // google ---------------------------------
//     app.get('/unlink/google', isLoggedIn, function(req, res) {
//         var user          = req.user;
//         user.google.token = undefined;
//         user.save(function(err) {
//             res.redirect('/profile');
//         });
//     });


};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    console.log('isLoggedIn> Called');
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

function verifyToken(req, res, next) {
    let payload = "";
    if (!req.headers.authorization) {
        return res.status(401).send('Unauthorized request')
    }
    let token = req.headers.authorization.split(' ')[1]
    if (token === 'null') {
        return res.status(401).send('Unauthorized request')
    }
    try {
        let payload = jwt.verify(token, conf.secretKey)
        // console.log('payload = ', payload)
    } catch (err) {
        console.log(err);
        return res.status(401).send('Unauthorized request')
    }
    if (payload == null) {
        // console.log("401-4", payload);
        return res.status(401).send('Unauthorized request')
    }
    req.userId = payload.subject
    next()
}
  