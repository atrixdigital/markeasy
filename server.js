var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

var filename;
var filepath;


// var morgan = require('morgan'); // Import Morgan Package

//multer for handling files
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        //consider opening new folder for each user.
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        //only files with pdf format will be accepted
        if (!file.originalname.match(/\.(pdf)$/)) {
            var err = new Error();
            err.code = 'filetype';
            return cb(err);
        } else {
            cb(null, file.originalname);
            filename = file.originalname;
            //path where the file is uploaded to server
            filepath = ("/uploads/"+filename);
            console.log(filename);
            console.log(filepath);
        }
    }
});
//set a file limit of 10M
var upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }
}).single('myfile');


// app.use(morgan('dev')); // Morgan Middleware

//this is the route called whenever file is uploaded by user
app.post('/upload', function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                res.json({ success: false, message: 'File size is too large. Max limit is 10MB' });
            } else if (err.code === 'filetype') {
                res.json({ success: false, message: 'Filetype is invalid. Must be .pdf' });
            } else {
                res.json({ success: false, message: 'Unable to upload file' });
            }
        } else {
            if (!req.file) {
                res.json({ success: false, message: 'No file was selected' });
            } else {
                //no error, and we also have a file! success state
                //path of uploaded file is also returned
                res.json({ success: true, message: 'File uploaded!', path: filepath});
            }
        }
    });
});




//connect to our local database
mongoose.connect('mongodb://localhost/loginapp', function (err) {
    if (err) {
        console.log('Not connected to the database : ' + err);
    }
    else {
        console.log('Connected successfully to mongoDB');
    }
});

//init app


var port = process.env.PORT || 3000; // set our port
// mongoose.connect(db.url); // connect to our mongoDB database (commented out after you enter in your own credentials)

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({extended: true})); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(path.join(__dirname, 'public'))); // set the static files location /public/img will be /img for users

//these are like interceptors, they gonna look at the request before any1 else.
app.use(cookieParser());


// routes ==================================================
//require('./routes/router')(app); // pass our application into our routes

var usersRoute = require('./app/routes/users.js');
var assignmentsRoute = require('./app/routes/assignments.js');
var submissionsRoute = require('./app/routes/submissions.js');

//send app and passport to our social file
require('./app/passport/passport')(app,passport);

app.use('/users/', usersRoute);
app.use('/assignments/', assignmentsRoute);
app.use('/submissions/',submissionsRoute)

//define a "catch all" - all routing should be done with angular
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
    console.log('tickles.. req url is ' + req.url);
    console.log(res.status);

});

// start app ===============================================
app.listen(port);
console.log('Magic happens on port ' + port);           // shoutout to the user
exports = module.exports = app;                         // expose app

