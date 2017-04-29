/**
 * Created by Nir on 24/01/2017.
 */
var express = require('express');
var router = express.Router();


/*  this file will handle assignments methods such as adding new assignment or viewing one.
    we will also offer CRUD capabilities for the assignment objects
*/

//we may also need to use a user object.
var User = require('../models/user');
var Assignment = require('../models/assignment');
var StandardError = require('../models/standardError');

//REGISTER NEW ASSIGNMENT
router.post('/addAssignment', function (req, res) {

    //we want to get all the stuff that is being submitted and paste it into a variable
    var assignment = new Assignment();

    assignment.assignment_name = req.body.assignment_name;
    assignment.description = req.body.submissionDescription;
    //this will be the name of the user that is currently logged in
    assignment.created_by = req.body.created_by;
    //add date to the assignment creation
    assignment.date_created = new Date;
    assignment.due_date = req.body.submissionDate;

    if (assignment.assignment_name == null || assignment.assignment_name == '') {
        //sending false success response back to the client
        res.json({success: false, message: 'Ensure assignment name was provided!'});
    }

    //standard errors are object that are also saved in a different collection
    for (var i = 0; i < req.body.standard_errors.length; i++) {
        var newError = new StandardError();
        newError.error_name = req.body.standard_errors[i].name;
        newError.description = req.body.standard_errors[i].description;
        newError.created_by = req.body.created_by;
        newError.date_created = new Date;
        newError.grade_impact = req.body.standard_errors[i].gradeImpact;
        newError.save(function (err) {
            if (err) {
                res.json({success: false, message: 'problem with saving an error' + err.message});
            } else {
                console.log('error saved in database ' + newError._id);
            }
        });
        assignment.standard_errors.push(newError._id);
    }

    assignment.save(function (err) {
        if (err) {
            res.json({success: false, message: 'this assignment name already in use!! ' + err.message});
        } else {
            res.json({success: true, message: assignment.assignment_name + ' added to your assignments list '});
        }
    });



    //examiners are referred to by strings
    for (var i = 0; i < req.body.examiners.length; i++) {
        assignment.examiners.push(req.body.examiners[i]);
        //connect all examiners to their objects
        //ConnectExaminerWithDocument();

        console.log(req.body.examiners[i]);

        console.log('trying to find examiner with name: ' ,req.body.examiners[i]);
        User.findOne({ username: req.body.examiners[i] }, function(error, user) {
            if (error) {
                console.log('error!' );
                res.json({success: false, message: 'one of the examiners does not present in our database!'});
            }
            if(!user) {
                console.log('null user!!' );
                res.json({success: false, message: 'user is null!'});
            }
            else{
                //TODO: check if the user already posses a list of relevant assignments. if not, create one and save the user.
                console.log('There is a user found: ' + user.name + ' trying to assign him an assignment name of ' + req.body.assignment_name );
                console.log('pushing to this examiners relevant assignment array, assignment id of:   ' + assignment._id);
                user.relevant_assignments.push(assignment._id);
                user.save(function (err) {
                    if (err) {
                        res.json({success: false, message: 'problem with saving an assignment on a user ' + err.message});
                    } else {
                        console.log('new relevant assignment saved in database for user' + user._id);
                    }
                });
            }
        });
    }
});

router.post('/addErrorToAssignment/:id', function (req, res) {
    var editAssignmentId = req.params.id;
    console.log('INSIDE addErrorToAssignment');

    var newError = new StandardError();
    newError.error_name = req.body.name;
    newError.description = req.body.description;
    newError.grade_impact = req.body.gradeImpact;
    newError.parent_assignment = req.params.id;
    newError.created_by = req.body.created_by;
    newError.date_created = new Date();

    StandardError.find({error_name: req.body.name}, {_id: 1}, function (err,standard_error) {
        if(err) {
            console.log('error in find');
        }else
        {
            if(standard_error.length) {
                console.log('there is already one error with that name: '+ standard_error.length);
                res.json({success: false, message: 'error with that name already exists!'});

            }else{
                console.log('no error with that name! safe to insert ! '+ standard_error.length);

                newError.save(function (err) {
                    console.log('trying to save the new error');
                    if (err) {
                        res.json({success: false, message: 'problem with saving an error'});
                    } else {
                        console.log('STANDARD ERROR SAVE PASS');
                    }
                });

                //update the object in the assignment model after check that it does not exist there.
                Assignment.update({_id: editAssignmentId}, {$addToSet: {standard_errors: newError}}, function (err, assignment) {
                    if (err) {
                        res.json({success: false, message: 'problem with updating array'});
                    } else {
                        if (assignment) {
                            console.log('no error. should have assignment object and updated errors.');
                            res.json({success: true, errors: assignment.standard_errors});
                        }
                    }
                });


            }
        }
    }).limit(1);

});

router.get('/getAllAssignments', function (req, res) {
    Assignment.find({}, function (err, assignments) {
        if (err) {
            throw err;
        }
        else {
            res.json({success: true, assignments: assignments});
        }

    });

    // res.json({success: true, message: 'getting assignments for u'});
});



//deleting an assignment from the DB. need to delete all the references inside the examiners object to this assignments.
router.delete('/users_management/:assignment_name', function (req, res) {
    var deletedAssignment = req.params.assignment_name;
    //the goal is to delete all the associations with this assignment as well. refs on user models and standard errors...
    //therfore when deleting an assignment, the pre remove method will be called where we will delete all users refs

        Assignment.findOneAndRemove({assignment_name: deletedAssignment}, function (err, assignment) {
            if (err) throw err;
            //if no error - we successfully deleted the user!
            console.log('no error should delete assignment!!');
            res.json({success: true, message: 'requested assignment deleted successfully'});
        });

});



router.get('/getAllExaminers', function (req, res) {
    User.find({permission: 'moderator'}, function (err, users) {
        if (err)
            throw err;

        if (!users) {
            res.json({success: false, message: 'Users not found'});
        }
        else {
            console.log('no error should return users.');
            res.json({success: true, users: users});
        }

    });
});


router.get('/getAssignmentErrors/:id', function (req, res) {
    console.log('router getAssignmentErrors ');
    var editAssignment = req.params.id;
    Assignment.findOne({_id: editAssignment}).populate('standard_errors').exec(function (err, assignment) {
        if (err)
            throw err;
        if (!assignment) {
            console.log('sorry but no errors found for this assignment!!');
            res.json({success: false, message: 'no such assignment has been found'});
        } else {
            console.log('great success with getting errors!');
            res.json({success: true, errors: assignment.standard_errors});
        }
    })

});


router.get('/edit/:id', function (req, res) {
    console.log('routerGet edit assignment');

    var editAssignment = req.params.id;
    Assignment.findOne({_id: editAssignment}, function (err, assignment) {
        if (err) {
            console.log('some error in edit assignment');
            throw err;
        }
        if (!assignment) {
            console.log('sorry but no assignment!');
            res.json({success: false, message: 'no such assignment has been found'});
        } else {
            console.log('great successs!');
            res.json({success: true, assignment: assignment});
        }
    });
});


router.put('/edit', function (req, res) {
    console.log('router put finally');
//this route is for the assignment edit where the admin can edit assignment's fields.
    var editAssignment = req.body._id;

    if (req.body.name)
        var newName = req.body.name;
    if (req.body.due_date)
        var newDueDate = req.body.due_date;
    if (req.body.errors)
        var newErrorsList = req.body.errors;
    if (req.body.description)
        var newDescription = req.body.description;
    // if(req.body.permission)
    //     var newPermission = req.body.permission;

    if (newName) {
        Assignment.findOne({_id: editAssignment}, function (err, assignment) {
            if (err) throw err;
            if (!assignment) {
                console.log('not found' + editAssignment);
                res.json({success: false, message: 'No such assignment found '});
            } else {
                console.log('router put success here assignning ' + newName);

                assignment.assignment_name = newName;
                assignment.save(function (err) {
                    if (err)
                        console.log(err);
                    else {
                        res.json({success: true, message: 'Name has been updated'});
                    }
                })
            }
        });
    }


    // edit the due date of the assignment
    if (newDueDate) {
        //first find the current selected assignment
        Assignment.findOne({_id: editAssignment}, function (err, assignment) {
            if (err) throw err;
            if (!assignment) {
                console.log('not found' + editAssignment);
                res.json({success: false, message: 'No such assignment found '});
            } else {
                //case we found the assignment object (by its id)
                console.log('router put success here assignning ' + newDueDate);
                assignment.due_date = newDueDate;
                assignment.save(function (err) {
                    if (err)
                        console.log(err);
                    else {
                        res.json({success: true, message: 'Due date has been updated'});
                    }
                })
            }
        });
    }


    // edit the due date of the assignment
    if (newErrorsList) {
        //first find the current selected assignment
        Assignment.findOne({_id: editAssignment}, function (err, assignment) {
            if (err) throw err;
            if (!assignment) {
                console.log('not found' + editAssignment);
                res.json({success: false, message: 'No such assignment found '});
            } else {
                //case we found the assignment object (by its id)
                console.log('LISTEN UPPPP no error in error list put');
                assignment.standard_errors = newErrorsList;
                assignment.save(function (err) {
                    if (err)
                        console.log(err);
                    else {
                        res.json({success: true, message: 'errors has been updated'});
                    }
                })
            }
        });
    }

    if(newDescription) {
        Assignment.findOne({_id: editAssignment} , function (err, assignment) {
            if(err) throw err;
            if(!assignment) {
                res.json({success: false, message: 'No Assignment was found'});
            } else {
                assignment.description = newDescription;
                assignment.save(function (err) {
                    if(err)
                        console.log(err);
                    else {
                        res.json({success: true , message : 'description has been updated'});
                    }
                })
            }
        });

    }


    //TODO: implement further CRUD capabilities for the assignment object.

    //
    // if(newPermission) {
    //     if(mainUser.permission === 'admin') {
    //         User.findOne({_id  : editUser} , function (err, user) {
    //             if(err) throw err;
    //             if(!user) {
    //                 res.json({success: false, message: 'No user found'});
    //             } else {
    //                 user.permission = newPermission;
    //                 user.save(function (err) {
    //                     if(err)
    //                         console.log(err);
    //                     else {
    //                         res.json({success: true , message : 'permissions has been updated'});
    //                     }
    //                 })
    //             }
    //         });
    //     }else {
    //         res.json({success: false, message: 'Not enough permissions'});
    //
    //     }
    // }

});

router.get('/getSpecificError/:id', function (req, res) {
    console.log('router getAssignmentErrors ');
    var errorObjectId = req.params.id;
    StandardError.findOne({_id: errorObjectId}).exec(function (err, standard_error) {
        if (err)
            throw err;
        if (!standard_error) {
            console.log('sorry but no error found with that id!!');
            res.json({success: false, message: 'no such error has been found'});
        } else {
            console.log('great success with getting a specific error!');
            res.json({success: true, error: standard_error});
        }
    })

});


router.put('/editError', function (req, res) {
    console.log('router put of edit error!!');
//this route is for the assignment edit where the admin can edit assignment's fields.
    var editError = req.body._id;

    if (req.body.name)
        var newName = req.body.name;
    // if (req.body.due_date)
    //     var newDueDate = req.body.due_date;
    // if (req.body.errors)
    //     var newErrorsList = req.body.errors;
    // if (req.body.description)
    //     var newDescription = req.body.description;
    // if(req.body.permission)
    //     var newPermission = req.body.permission;

    if (newName) {
        StandardError.findOne({_id: editError}, function (err, standard_error) {
            if (err) throw err;
            if (!standard_error) {
                console.log('not found' + editError);
                res.json({success: false, message: 'No such standard_error found '});
            } else {
                console.log('router put success assigning new name to error ' + newName);

                standard_error.error_name = newName;
                standard_error.save(function (err) {
                    if (err)
                        console.log(err);
                    else {
                        res.json({success: true, message: 'Name has been updated'});
                    }
                })
            }
        });
    }


});


//gonna need to get assignment by id router.post('/assignments/assignmentsId' , function(req,res));
module.exports = router;