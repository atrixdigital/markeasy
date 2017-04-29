var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var router = express.Router();


//this file will handle users requests like login and registration
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'keyboard cat';

//REGISTER NEW USER
router.post('/register', function (req, res) {

    //we want to get all the stuff that is being submitted and paste it into a variable
    var user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.username = req.body.username;
    user.password = req.body.password;
    var password2 = req.body.password_confirm;

    if (user.username == null || user.username == '' || user.password == null || user.password == '' || user.email == null || user.email == '') {
        //sending response back to the client
        res.json({success: false, message: 'Ensure username, email and password were provided!'});
    }
    else {
        if (user.password != password2) {
            res.json({success: false, message: "passwords don't match"});
        }
        else {
            user.save(function (err) {
                if (err) {
                    if (err.errors.name) {
                        res.json({success: false, message: err.errors.name.message});
                    } else if (err.errors.username) {
                        res.json({success: false, message: err.errors.username.message});
                    } else if (err.errors.email) {
                        res.json({success: false, message: err.errors.email.message});
                    } else {
                        res.json({success: false, message: 'this username or email already in use!! '});
                    }
                } else {
                    res.json({success: true, message: 'User Created !!! '});
                }
            });
        }
    }
});


//USER LOGIN !

router.post('/authenticate', function (req, res) {
    User.findOne({username: req.body.username}).select('email username password').exec(function (err, user) {
        if (err)
            throw err;
        if (!user) {
            res.json({success: false, message: 'Could not authenticate user'});
        } else if (user) {
            if (req.body.password) {
                var validPassword = user.comparePassword(req.body.password);
            } else {
                res.json({success: false, message: 'no password provided!'});
            }
            if (!validPassword) {
                res.json({success: false, message: 'Could not authenticate password'});
            } else {
                //this is the place where we can tell the user is authenticated, lets give him a token for 24 hours!
                var token = jwt.sign({username: user.username, email: user.email}, secret, {expiresIn: '1h'});
                //return the success plus the token
                res.json({success: true, message: 'User authenticated and getting 1h of surfing', token: token});
            }
        }
    });
});

//middleware to get the token
router.use(function (req, res, next) {
    var token = req.body.token || req.body.query || req.headers['x-access-token'];

    if (token) {
        //verify token
        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                res.json({success: false, message: 'Token invalid'});
            } else {
                //this is the case where we verified the token
                req.decoded = decoded;
                //next will let the application continue to 'currentUser' route...
                next();
            }
        });
    } else {

        res.json({success: false, message: 'No token provided'});
    }
});

//RETRIEVE DATA ABOUT THE LOGGED USER
router.post('/currentUser', function (req, res) {
    //sends back the token decoded
    res.send(req.decoded);
});

router.get('/fullUserData', function (req, res) {
    User.findOne({username: req.decoded.username}).exec(function (err, user) {
        if (err) {
            res.json({success: false ,message:'no user connected'});
            throw err;
        }
        if (user) {
            //console.log('not errorrrrrrrrrrrrrr');
            res.json({success: true ,username: user.username, userFullName: user.name, role: user.permission, _id: user._id, relevant_assignments: user.relevant_assignments});
        }
    });
})

router.get('/renewToken/:username', function (req, res) {
    User.findOne({username: req.params.username}).select().exec(function (err, user) {
        if (err)
            throw err;
        if (!user) {
            res.json({success: false, message: 'No user was found'});
        } else {
            var newToken = jwt.sign({username: user.username, email: user.email}, secret, {expiresIn: '24h'});
            //return the success plus the token
            res.json({success: true, token: newToken});
        }


    });
});

router.get('/permission', function (req, res) {
    User.findOne({username: req.decoded.username}, function (err, user) {
        if (err)
            throw err;
        if (!user) {
            res.json({success: false, message: 'No user was found'});
        } else {
            res.json({success: true, permission: user.permission});
        }
    })
});

//dont forget to add middle ware to check for permissions before getting to this route
router.get('/users_management', function (req, res) {
    User.find({}, function (err, users) {
        if (err)
            throw err;
        User.findOne({username: req.decoded.username}, function (err, mainUser) {
            if (err)
                throw err;
            if (!mainUser) {
                res.json({success: false, message: 'No user found'});
            }
            else {
                if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                    //this is where the user actually have the permissions
                    if (!users) {
                        res.json({success: false, message: 'Users not found'});
                    }
                    else {
                        //console.log('no error should return users.');
                        res.json({success: true, users: users, permission: mainUser.permission});
                    }
                }
                else {
                    res.json({success: false, message: 'insufficient permissions'});
                }
            }
        });

    })
});


router.get('/users_management', function (req, res) {
    User.find({}, function (err, users) {
        if (err)
            throw err;
        User.findOne({username: req.decoded.username}, function (err, mainUser) {
            if (err)
                throw err;
            if (!mainUser) {
                res.json({success: false, message: 'No user found'});
            }
            else {
                if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                    //this is where the user actually have the permissions
                    if (!users) {
                        res.json({success: false, message: 'Users not found'});
                    }
                    else {
                        console.log('no error should return users.');
                        res.json({success: true, users: users, permission: mainUser.permission});
                    }
                }
                else {
                    res.json({success: false, message: 'insufficient permissions'});
                }
            }
        });

    })
});


router.delete('/users_management/:username', function (req, res) {
    //first grab the user name that is being passed through the userparam

    var deletedUser = req.params.username;
    User.findOne({username: req.decoded.username}, function (err, mainUser) {
        if (err) throw err;
        if (!mainUser) {
            res.json({success: false, message: 'No user is logged in'});
        } else {
            if (mainUser.permission !== 'admin') {
                res.json({success: false, message: 'Insufficient Permissions!'});
            } else {
                User.findOneAndRemove({username: deletedUser}, function (err, user) {
                    if (err) throw err;
                    //if no error - we successfully deleted the user!
                    console.log('no error should delete user!');
                    res.json({success: true, message: 'requested user deleted successfully'});
                });
            }
        }
    });
});

router.get('/edit/:id', function (req, res) {
    var editUser = req.params.id;
    User.findOne({username: req.decoded.username}, function (err, mainUser) {
        if (err) throw err;
        if (!mainUser) {
            res.json({success: false, message: 'No user found'});
        } else {
            if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                User.findOne({_id: editUser} , function (err, user) {
                    if(err) throw err;
                    if(!user) {
                        res.json({success: false, message: 'no user has been found'});
                    } else {
                        res.json({success: true, user: user});
                    }
                })
        } else{
                res.json({success: false, message: 'Insufficient Permissions!'});
            }
        }

    })
});

router.put('/edit' , function (req,res) {
//this route is for the users_management/edit where the admin can edit user's fields.
    var editUser = req.body._id;

    if(req.body.name)
        var newName = req.body.name;
    if(req.body.username)
        var newUsername = req.body.username ;
    if(req.body.email)
        var newEmail = req.body.email;
    if(req.body.permission)
        var newPermission = req.body.permission;


    User.findOne({username: req.decoded.username} , function (err, mainUser) {
        if (err) throw err;
        if (!mainUser) {
            res.json({success: false, message: 'No user found'});
        } else {
            if(newName) {
                if(mainUser.permission === 'admin') {
                    User.findOne({_id : editUser} , function (err, user) {
                        if(err) throw err;
                        if(!user) {
                            res.json({success: false, message: 'No user found'});
                        } else {
                            user.name = newName;
                            user.save(function (err) {
                                if(err)
                                    console.log(err);
                                else {
                                    res.json({success: true , message : 'Name has been updated'});
                                }
                            })
                        }
                    });
                }else {
                    res.json({success: false, message: 'Not enough permissions'});

                }
            }

            if(newUsername) {
                if(mainUser.permission === 'admin') {
                    User.findOne({_id  : editUser} , function (err, user) {
                        if(err) throw err;
                        if(!user) {
                            res.json({success: false, message: 'No user found'});
                        } else {
                            user.username = newUsername;
                            user.save(function (err) {
                                if(err)
                                    console.log(err);
                                else {
                                    res.json({success: true , message : 'username has been updated'});
                                }
                            })
                        }
                    });
                }else {
                    res.json({success: false, message: 'Not enough permissions'});

                }
            }



            if(newEmail) {
                if(mainUser.permission === 'admin') {
                    User.findOne({_id  : editUser} , function (err, user) {
                        if(err) throw err;
                        if(!user) {
                            res.json({success: false, message: 'No user found'});
                        } else {
                            user.email = newEmail;
                            user.save(function (err) {
                                if(err)
                                    console.log(err);
                                else {
                                    res.json({success: true , message : 'email has been updated'});
                                }
                            })
                        }
                    });
                }else {
                    res.json({success: false, message: 'Not enough permissions'});

                }
            }

            if(newPermission) {
                if(mainUser.permission === 'admin') {
                    User.findOne({_id  : editUser} , function (err, user) {
                        if(err) throw err;
                        if(!user) {
                            res.json({success: false, message: 'No user found'});
                        } else {
                            user.permission = newPermission;
                            user.save(function (err) {
                                if(err)
                                    console.log(err);
                                else {
                                    res.json({success: true , message : 'permissions has been updated'});
                                }
                            })
                        }
                    });
                }else {
                    res.json({success: false, message: 'Not enough permissions'});

                }
            }
        }

    });
});

module.exports = router;