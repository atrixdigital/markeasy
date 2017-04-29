/**
 * Created by Nir on 24/02/2017.
 */

var express = require('express');
var router = express.Router();


/*
 this route file will handle all the requests regarding submissions, such as:
 adding new submission on behalf of a student.
 examining of user's submission by an examiner.
 marking of errors during testing ( generation of error instances )
 grade calculation will be an output of testing a submission. that is by summing all errors effects.
 */

//for the submission route we will basically need to use all of our database objects..
var User = require('../models/user');
var Assignment = require('../models/assignment');
var StandardError = require('../models/standardError');
var ErrorInstance = require('../models/standardErrorInstance');
var Submission = require('../models/submission');


//new submission post
router.post('/addSubmission', function (req, res) {
    var submission = req.body
    console.log('inside the add submissions request.');
    console.log(req.body);
    var submission = new Submission();
    // submission.parent_assignment= to be added,
    submission.checked = false;
    submission.submission_name = req.body.submission_name; // the user will be asked to enter a title for his submission
    // submission.standard_errors_instances= To be added, //list of all errors captured
    // submission.grade= To be added,
    submission.description = req.body.submission_description;
    submission.submitted_by= "Student";
    submission.date_created = new Date;
    submission.path = req.body.file_path;

    submission.save(function (err) {
        if (err) {
            console.log("Error while saving schema"+err)
        } else {
            res.json({success: true, message: 'submission saved !!! '});
        }
    });

    console.log("Submission added");


});




module.exports = router;