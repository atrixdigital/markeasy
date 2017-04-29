/**
 * Created by Nir on 23/01/2017.
 */

angular.module('assignmentController', ['userServices', 'assignmentServices' ,'ngMaterial'])
    .controller('assignmentCtrl', function ($scope, User, Assignment, $mdDialog , $timeout) {

        console.log('testing assignment ctrl');
        var app = this;

        app.loading = true;
        app.accessDenied = true;
        app.errorMsg = false;
        app.editAccess = true;
        app.deleteAccess = true;
        app.limit = 5;



        function getAssignments() {
            Assignment.getAssignments().then(function (data) {

                app.loading = false;
                app.accessDenied = false;


                if (data.data.success) {
                    //should check somewhere for the permissions of the user.
                    app.assignments = data.data.assignments;

                    console.log('data success promise');
                } else {
                    console.log('somehow no success');
                    app.errorMsg = data.data.message;
                    app.loading = false;

                }
            });
        }

        // Function: Perform a basic search function
        app.search = function(searchKeyword, number) {
            console.log('inside search, number dont exist' );
            // Check if a search keyword was provided
            if (searchKeyword) {
                // Check if the search keyword actually exists
                if (searchKeyword.length > 0) {
                    app.limit = 0; // Reset the limit number while processing
                    $scope.searchFilter = searchKeyword; // Set the search filter to the word provided by the user
                    app.limit = number;
                } else {
                    $scope.searchFilter = undefined; // Remove any keywords from filter
                    app.limit = 0; // Reset search limit
                }
            } else {
                $scope.searchFilter = undefined; // Reset search limit
                app.limit = 0; // Set search limit to zero
            }
        };

        $scope.changedValue = function(number) {
            if(number>0) {
                app.limit = number;
            } else{
                app.showMoreError = 'please enter a valid number';
            }
        }

        // Function: Clear all fields
        app.clear = function() {
            $scope.number = 'Clear'; // Set the filter box to 'Clear'
            app.limit = 0; // Clear all results
            $scope.searchKeyword = undefined; // Clear the search word
            $scope.searchFilter = undefined; // Clear the search filter
            app.showMoreError = false; // Clear any errors
        };

        app.showAll = function () {

            app.limit = undefined;
            app.showMoreError = false;
        };

        console.log('calling get assignments');
        getAssignments();


        app.deleteAssignment = function (assignment_name) {
            console.log(' deleteAssignment in services');

            Assignment.deleteAssignment(assignment_name).then(function (data) {
                if (data.data.success) {
                    app.showMoreError = username + ' deleted from database';
                    getAssignments();
                } else {
                    app.showMoreError = data.data.message;
                }
            });
        };

        app.showConfirm = function(assignment_name) {
            console.log('hello from show confirm');

            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to permanently delete this user?')
                .textContent('This action is irreversible.')
                .ariaLabel('Lucky day')
                .targetEvent()
                .ok('DO IT!')
                .cancel('CANCEL');
            $mdDialog.show(confirm).then(function() {
                app.deleteAssignment(assignment_name);
            }, function() {
                console.log('canceled delete');
            });
        };




    })

    .controller('addAssignmentCtrl', function ($scope, User, Assignment, $location, $timeout , $mdDialog) {
        //set the token if there is no error

        var app = this;


        app.loading = false;
        app.accessDenied = true;
        app.errorMsg = false;
        app.editAccess = false;
        app.deleteAccess = false;
        app.limit = 5;




        $scope.showAdvanced = function(ev) {
            $mdDialog.show({
                controller: function(){
                    return app;
                },
                // controllerAs: 'addAssignment',
                templateUrl: '../../views/assignments/add_error.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
            })
                .then(function(result) {
                    $scope.errors.push(result);
                    app.errorMsg=false;
                    app.successMsg= result.name + ' added to errors list';
                    $scope.error_status = 'You said the information was "' + result + '".';
                }, function() {
                    $scope.error_status = 'You cancelled the dialog.';
                });
        };


        console.log('testing add assignment controller');

        $scope.changedValue = function(item) {
            /(\r\n|\n|\r)/gm,""
            var examinerNameFromSelect = item.trim();
            console.log('item I push is ' + examinerNameFromSelect);

            $scope.newExaminer = examinerNameFromSelect;
        }


///handling examiners///////////////////////
        function getExaminers() {
            User.getFullUserInfo().then(function (data) {
                console.log('calling get examiners');
                $scope.currentUser = data.data.username;
                console.log('loging user name ' + $scope.currentUser);
                console.log('initializing list of examiners');
                $scope.examiners = [];
                $scope.availableExaminers= [];
                $scope.examiners.push($scope.currentUser);
                Assignment.getExaminers().then(function (data) {
                    console.log('pushing list of examiners to the available examiners array');
                    for(var i=0 ; i<data.data.users.length ; i++){
                        console.log('pushing examiner ' + data.data.users[i].username);
                        $scope.availableExaminers.push(data.data.users[i].username);
                    }
                });

            });
        }

        $scope.addExaminer = function () {
            if($scope.newExaminer == '' || $scope.newExaminer == null) {
                app.errorMsg = 'no examiner was selected...';
                app.successMsg =false;
            }
            else{
                console.log('pushing SELECTED examiner ' + $scope.newExaminer);

                $scope.examiners.push($scope.newExaminer);
                app.errorMsg=false;
                app.successMsg = 'new examiner added to the list';
                $scope.newExaminer = '';
            }
        }

        $scope.clearExaminers = function () {
            app.successMsg = 'cleared list of examiners';
            app.errorMsg=false;
            $scope.examiners = [];
            //$scope.examiners.push($scope.currentUser);
            console.log('cleared examiners...');
            $scope.newExaminer = '';

        }

        getExaminers();

/////////////////// ///handling standard errors///////////////////////


        function getErrors() {
            User.getFullUserInfo().then(function (data) {
                console.log('calling get errors');
                $scope.currentUser = data.data.userFullName;
                console.log('loging user name ' + $scope.currentUser);
                console.log('initializing list of errors');
                $scope.errors = [];
                $scope.availableErrors= [];
                Assignment.getErrors().then(function (data) {
                    console.log('pushing list of errors to the available errors array');
                    for(var i=0 ; i<data.data.errors.length ; i++){
                        $scope.availableErrors.push(data.data.errors[i]);
                    }
                });

            });
        }

        $scope.addError = function (errorData) {
            console.log('add error clicked!!!!' + errorData.newError + errorData.gradeImpact);
            if(errorData.newError == '' || errorData.newError == null) {

                console.log('some error detected but there is hope: ' + errorData.newError);

                app.errorMsg = 'no error was typed...';
                app.successMsg =false;
            }
            else{
                //create full error struct here instead of only name
                var newError ={
                    name: errorData.newError,
                    description: errorData.description,
                    gradeImpact: errorData.gradeImpact,
                    createdBy: app.currentUser
                }

                $mdDialog.hide(newError);
                app.successMsg = 'new error added to the list';
                $scope.newError = '';
            }
        }

        $scope.clearErrors = function () {
            app.successMsg = 'cleared list of errors';
            app.errorMsg=false;
            $scope.errors = [];
            console.log('cleared errors...');
            $scope.newError = '';

        }

        getErrors();

///////////////////


        this.addAssignment = function (assignmentData) {
            console.log(assignmentData);

            // if(assignmentData.assignment_name == '' || assignmentData.assignment_name == null ) {
            //     console.log('its empty!');
            // }

            console.log('you requested to add ' + $scope.examiners.length + ' examiners:');
            for(var i =0 ; i<$scope.examiners.length ; i++ ) {
                console.log('examiner name : ' + $scope.examiners[i]);
            }

            console.log('form inside add assignment submitted');
            //after the creation of service I can reference specific methods of it
            //get the user name of the user that created this assignment


            User.getFullUserInfo().then(function (data) {
                console.log('inside function');
                console.log(data);
                app.assignmentData.created_by = data.data.userFullName;
                app.assignmentData.user_id = data.data._id;
                app.assignmentData.role = data.data.role;
                app.assignmentData.examiners = $scope.examiners;
                app.assignmentData.standard_errors = $scope.errors;
                Assignment.create(app.assignmentData).then(function (data) {

                    app.loading = true;
                    app.errorMsg = false;
                    console.log(data.data.success);
                    console.log(data.data.message);

                    if (data.data.success) {
                        app.successMsg = data.data.message + ' , thank you.';
                        app.loading = false;
                        //to make it look a bit better I added a delay
                        //TODO : add markeasy animation small gif
                        $timeout(function () {
                            console.log('some test print');
                            $location.path('/assignments');
                        }, 2000);
                        //create success message
                        //redirect to homepage
                    } else {
                        //create error message
                        app.errorMsg = data.data.message;
                        app.successMsg = false;
                        app.loading = false;

                    }
                });

            }).catch(function (err) {
                console.log('error!');
                app.errorMsg = err;
                app.successMsg = false;

            });
        };
    })
    .controller('editAssignmentCtrl', function ($scope, $routeParams, User, Assignment, $timeout, $mdDialog) {

        var app = this;
        $scope.nameTab = 'active';
        app.phase1 = true;
        app.errorMsg= false;
        app.successMsg = false;
        app.showEditingWindow = false;
        $scope.currentPage = 1;
        $scope.pageSize = 3;

        User.getFullUserInfo().then(function (data) {

            console.log('username is ' + data.data.userFullName );
            app.currentUser = data.data.userFullName;

        });



        //first thing we need when editing an assignment is to get all the relevant data about it.
        Assignment.getAssignment($routeParams.id).then(function (data) {
           if(data.data.success) {
               $scope.assignmentName = data.data.assignment.assignment_name;
               $scope.dueDate = data.data.assignment.due_date;
               $scope.createdBy = data.data.assignment.created_by;
               $scope.description = data.data.assignment.description;
               $scope.permission = ["Saab", "Volvo", "BMW" , "should be an array"];
               $scope.dateCreated = data.data.assignment.date_created;
               $scope.progressPercentage = data.data.assignment.progress_percentage;
               $scope.assignmentExaminers = data.data.assignment.examiners;
               console.log('got errors : ' + data.data.assignment.standard_errors);
               $scope.errors = data.data.assignment.standard_errors;
               getAssignmentErrors();
           }else {
            console.log('no success!');
           }
        });




        //this function eventually is populating the data using the assignment object id .
        //each standardError object id is being converted to true document of data.
        function getAssignmentErrors() {
                Assignment.getAssignmentErrors($routeParams.id).then(function (data) {
                    console.log('pushing list of errors to the available errors array');
                    $scope.errors = data.data.errors;
                });
        }


        $scope.showAdvanced = function(ev) {
            $mdDialog.show({
                controller: function(){
                    return app;
                },
                templateUrl: '../../views/assignments/add_error.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
            })
                .then(function(result) {

                    //RESULT: its the data that came back from the dialog box, just adding the name of the author
                    result.created_by = app.currentUser ;
                    console.log('current user is ' + app.currentUser);

                    Assignment.addNewError($routeParams.id, result).then(function (data) {
                       if(data.data.success) {
                           console.log('I added a brand new error for u!');
                           app.successMsg = 'error added successfully';
                           $scope.errors = data.data.errors;
                           getAssignmentErrors();
                       } else{
                           app.successMsg = false;
                           console.log('YES WE UNDERSTAND');
                           app.errorMsg = 'there is already an error with that name!';
                       }
                    });

                    console.log('current errors: ' + JSON.stringify($scope.errors));
                    app.errorMsg=false;
                    app.successMsg = result.name + ' added to errors list';
                    $scope.error_status = 'You said the information was "' + result + '".';
                }, function() {
                    $scope.error_status = 'You cancelled the dialog.';
                });
        };


        app.namePhase = function () {
            $scope.nameTab = 'active';
            app.phase1 = true;
            app.phase2 = false;
            app.phase3 = false;
            app.phase4 = false;
            app.showEditingWindow = true;
            $scope.descriptionTab = 'default';
            $scope.dueDateTab = 'default';
            $scope.permissionTab = 'default';
            app.errorMsg = false;

        }
        app.dueDatePhase = function () {
            $scope.dueDateTab = 'active';
            app.phase1 = false;
            app.phase2 = true;
            app.phase3 = false;
            app.phase4 = false;
            app.showEditingWindow = true;
            $scope.nameTab = 'default';
            $scope.descriptionTab = 'default';
            $scope.permissionTab = 'default';
            app.errorMsg = false;


        }
        app.descriptionPhase = function () {
            $scope.descriptionTab = 'active';
            app.phase1 = false;
            app.phase2 = false;
            app.phase3 = true;
            app.phase4 = false;
            app.showEditingWindow = true;
            $scope.nameTab = 'default';
            $scope.dueDateTab = 'default';
            $scope.permissionTab = 'default';
            app.errorMsg = false;


        }

        app.permissionPhase = function () {
            $scope.permissionTab = 'active';
            app.phase1 = false;
            app.phase2 = false;
            app.phase3 = false;
            app.phase4 = true;
            $scope.nameTab = 'default';
            $scope.descriptionTab = 'default';
            $scope.dueDateTab = 'default';
            app.errorMsg = false;

        }

        app.updateName = function (newName, valid) {
            app.errorMsg = false;
            app.disabled = true;
            var assignmentObject = {};
            if (valid) {
                assignmentObject._id = $routeParams.id;
                assignmentObject.name = $scope.newName;
                Assignment.editAssignment(assignmentObject).then(function (data) {
                    if (data.data.success) {
                        app.successMsg = data.data.message;
                        $timeout(function () {
                            app.nameForm.name.$setPristine();
                            app.nameForm.name.$setUntouched();
                            $scope.assignmentName = assignmentObject.name;
                            app.successMsg = false;
                            app.disabled = false;
                        }, 2000);
                    } else {
                        app.errorMsg = data.data.message;
                        app.disabled = false;
                    }
                });
            } else {
                app.errorMsg = 'please ensure form is filled out properly.'
                app.disabled = false;
            }
        };


        app.updateErrors = function () {
            console.log('inside update errors');
            app.errorMsg = false;
            app.disabled = true;
            var assignmentObject = {};
            assignmentObject._id = $routeParams.id;
            assignmentObject.errors = $scope.errors;
            Assignment.editAssignment(assignmentObject).then(function (data) {
                if (data.data.success) {
                    app.successMsg = data.data.message;
                    $timeout(function () {
                        app.nameForm.name.$setPristine();
                        app.nameForm.name.$setUntouched();
                        // $scope.errors = assignmentObject.name;
                        app.successMsg = false;
                        app.disabled = false;
                    }, 2000);
                } else {
                    app.errorMsg = data.data.message;
                    app.disabled = false;
                }
            });
        };


        app.updateDueDate = function (newDueDate) {
            app.errorMsg = false;
            var valid = true;
            app.disabled = true;
            var assignmentObject = {};
            if (valid) {
                assignmentObject._id = $routeParams.id;
                assignmentObject.due_date = $scope.newDueDate;
                Assignment.editAssignment(assignmentObject).then(function (data) {
                    if (data.data.success) {
                        app.successMsg = data.data.message;
                        $timeout(function () {
                            app.dueDateForm.newDueDate.$setPristine();
                            app.dueDateForm.newDueDate.$setUntouched();
                            $scope.assignmentDueDate = assignmentObject.due_date;
                            app.successMsg = false;
                            app.disabled = false;
                        }, 2000);
                    } else {
                        app.errorMsg = data.data.message;
                        app.disabled = false;
                    }
                });

            } else {
                app.errorMsg = 'please ensure form is filled out properly.'
                app.disabled = false;
            }

        };


        app.updatePermissions = function (newPermission) {
            app.errorMsg = false;
            app.disabled = true;
            var userObject = {};
            userObject._id = app.currentUser;
            userObject.permission = newPermission;
            User.editUser(userObject).then(function (data) {
                if (data.data.success) {
                    app.successMsg = data.data.message;
                    $timeout(function () {
                        app.successMsg = false;
                        if(newPermission === 'user') {
                            $scope.newPermission = 'user';
                        }else if(newPermission === 'moderator') {
                            $scope.newPermission = 'moderator';

                        }else if(newPermission === 'admin') {
                            $scope.newPermission = 'admin';
                        }
                    }, 2000);
                } else {
                    app.errorMsg = data.data.message;
                    app.disabled = false;
                }
            });
        };


        app.updateDescription = function (newPermission, valid) {
            app.errorMsg = false;
            app.disabled = true;
            var assignmentObject = {};
            if (valid) {
                assignmentObject._id = $routeParams.id;
                assignmentObject.description = $scope.newDescription;
                Assignment.editAssignment(assignmentObject).then(function (data) {
                    if (data.data.success) {
                        app.successMsg = data.data.message;
                        $timeout(function () {
                            app.descriptionForm.name.$setPristine();
                            app.descriptionForm.name.$setUntouched();
                            $scope.description = assignmentObject.description;
                            app.successMsg = false;
                            app.disabled = false;
                        }, 2000);
                    } else {
                        app.errorMsg = data.data.message;
                        app.disabled = false;
                    }
                });
            } else {
                app.errorMsg = 'please ensure form is filled out properly.'
                app.disabled = false;
            }


        };






        })
    .filter('pagination', function () {
        return function (data, start) {
            return data.slice(start);
        }
    })

    .controller('editErrorCtrl', function ($scope, $routeParams, User, Assignment, $timeout, $route, $mdDialog) {
        console.log('testing the edit error controller');

        var app = this;
        $scope.nameTab = 'active';
        app.phase1 = true;
        app.errorMsg= false;
        app.successMsg = false;
        app.showEditingWindow = false;


        //first thing we need when editing an error is to get all the relevant data about it.
        Assignment.getSpecificError($routeParams.id).then(function (data) {

            if(data.data.success) {
                console.log('YYYYYYYYYYYYYYYYYYYYYYYYYYYYYY');
                $scope.error_name = data.data.error.error_name;
                $scope.error_description = data.data.error.description;
                $scope.created_by = data.data.error.created_by;
                $scope.date_created = data.data.error.date_created;
                $scope.last_edited = data.data.error.last_edited;
                $scope.grade_impact = data.data.error.grade_impact;
                $scope.parent_assignment = data.data.error.parent_assignment;
                $scope.scope_meter = 'small';
                if($scope.grade_impact > 5) {
                    $scope.scope_meter = 'big mistake';
                }
                else if ($scope.grade_impact <5 && $scope.grade_impact >2 )
                {
                    $scope.scope_meter = 'normal mistake';
                }
                else {
                    $scope.scope_meter = 'minor mistake';
                }
            }else {
                console.log('no success!');
            }
        });


        User.getFullUserInfo().then(function (data) {

            console.log('username is ' + data.data.userFullName );
            app.currentUser = data.data.userFullName;

        });


        app.namePhase = function () {
            $scope.nameTab = 'active';
            app.phase1 = true;
            app.phase2 = false;
            app.phase3 = false;
            app.showEditingWindow = true;
            $scope.descriptionTab = 'default';
            $scope.impactTab = 'default';
            app.errorMsg = false;

        }
        app.descriptionPhase = function () {
            $scope.descriptionTab = 'active';
            app.phase1 = false;
            app.phase2 = true;
            app.phase3 = false;
            app.showEditingWindow = true;
            $scope.nameTab = 'default';
            $scope.impactTab = 'default';
            app.errorMsg = false;


        }
        app.impactPhase = function () {
            $scope.impactTab = 'active';
            app.phase1 = false;
            app.phase2 = false;
            app.phase3 = true;
            app.showEditingWindow = true;
            $scope.nameTab = 'default';
            $scope.descriptionTab = 'default';
            app.errorMsg = false;
        }


        app.updateName = function (newName, valid) {
            app.errorMsg = false;
            app.disabled = true;
            var errorObject = {};
            if (valid) {
                errorObject._id = $routeParams.id;
                errorObject.name = $scope.newName;
                Assignment.editSpecificError(errorObject).then(function (data) {
                    if (data.data.success) {
                        app.successMsg = data.data.message;
                        $timeout(function () {
                            app.nameForm.name.$setPristine();
                            app.nameForm.name.$setUntouched();
                            $scope.errorName = errorObject.name;
                            app.successMsg = false;
                            app.disabled = false;
                            $route.reload();
                        }, 2000);
                    } else {
                        app.errorMsg = data.data.message;
                        app.disabled = false;
                    }
                });
            } else {
                app.errorMsg = 'please ensure form is filled out properly.'
                app.disabled = false;
            }
        };



    });
