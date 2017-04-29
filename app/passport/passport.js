/**
 * Created by Nir on 15/01/2017.
 */

var FacebookStrategy = require('passport-facebook').Strategy;
var User =require('../models/user');
var session = require('express-session');
var jwt = require('jsonwebtoken');
var secret = 'keyboard cat';

module.exports = function (app,passport) {

    app.use(passport.initialize());
    app.use(passport.session());
    //express session
        app.use(session({
            secret: 'keyboard cat',
            resave: false,
            saveUninitialized: true,
            cookie : { secure : false}
        }));
    passport.serializeUser(function(user, done) {
        token = jwt.sign({username : user.username, email: user.email} , secret,  {expiresIn: '24h'});

        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new FacebookStrategy({
            clientID: '1077240552386949',
            clientSecret: '883e58535d166533940efb8f27bb805f',
            callbackURL: "http://localhost:3000/auth/facebook/callback",
            profileFields: ['id', 'displayName' , 'name', 'email']
        },
        function(accessToken, refreshToken, profile, done) {
            console.log(profile._json.email);
            User.findOne({email: profile._json.email}).select( 'username password email').exec(function (err,user) {
               if(err) {
                   console.log('first err');
                   done(err);

               }
               //make sure there is a user and he has a verified email
               if(user) {
                   console.log('no err');
                   done(null, user);
               } else {
                   console.log('second err');
                   console.log('print user: ' + user );

                   done(err);
               }
            });
        }
    ));

    // authentication has failed.
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', { failureRedirect: '/facebookerror'}),
        function (req,res) {
            //forward the user to a facebook page/route/view that will implement the token
            res.redirect('/facebook/' + token);
            //this was like overwriting the successRedirect..
        });

    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));


    return passport;
}

