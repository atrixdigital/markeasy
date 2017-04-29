/**
 * Created by Nir on 21/01/2017.
 */

angular.module('managementController', ['userServices', 'ngMaterial', 'ui.bootstrap'])
    .controller('managementCtrl', function ($scope, User) {

        console.log('testing mng ctrl');
        var app = this;

        app.loading = true;
        app.accessDenied = true;
        app.errorMsg = false;
        app.editAccess = false;
        app.deleteAccess = false;
        app.limit = 5;

        function getUsers() {
            User.getUsers().then(function (data) {
                if (data.data.success) {
                    console.log('data success promise');
                    if (data.data.permission === 'admin' || data.data.permission === 'moderator') {
                        console.log('has permissions GOOOOD');
                        app.users = data.data.users;
                        app.loading = false;
                        app.accessDenied = false;
                        if (data.data.permission === 'admin') {
                            app.editAccess = true;
                            app.deleteAccess = true;
                        } else if (data.data.permission === 'moderator') {
                            app.editAccess = true;
                        }
                    } else {
                        app.errorMsg = 'Insufficient permissions';
                        app.loading = false;
                    }
                } else {
                    console.log('somehow no success');

                    app.errorMsg = data.data.message;
                    app.loading = false;

                }
            });
        }

        getUsers();


        $scope.changedValue = function (number) {
            if (number > 0) {
                app.limit = number;
            } else {
                app.showMoreError = 'please enter a valid number';
            }
        }

        app.showAll = function () {

            app.limit = undefined;
            app.showMoreError = false;
        };

        // Function: Perform a basic search function
        app.search = function (searchKeyword, number) {
            // Check if a search keyword was provided
            if (searchKeyword) {
                // Check if the search keyword actually exists
                if (searchKeyword.length > 0) {
                    app.limit = 0; // Reset the limit number while processing
                    $scope.searchFilter = searchKeyword; // Set the search filter to the word provided by the user
                    app.limit = number; // Set the number displayed to the number entered by the user
                } else {
                    $scope.searchFilter = undefined; // Remove any keywords from filter
                    app.limit = 0; // Reset search limit
                }
            } else {
                $scope.searchFilter = undefined; // Reset search limit
                app.limit = 0; // Set search limit to zero
            }
        };

        // Function: Clear all fields
        app.clear = function () {
            $scope.number = 'Clear'; // Set the filter box to 'Clear'
            app.limit = 0; // Clear all results
            $scope.searchKeyword = undefined; // Clear the search word
            $scope.searchFilter = undefined; // Clear the search filter
            app.showMoreError = false; // Clear any errors
        };

        // Function: Perform an advanced, criteria-based search
        app.advancedSearch = function (searchByUsername, searchByEmail, searchByName) {
            // Ensure only to perform advanced search if one of the fields was submitted
            if (searchByUsername || searchByEmail || searchByName) {
                $scope.advancedSearchFilter = {}; // Create the filter object
                if (searchByUsername) {
                    $scope.advancedSearchFilter.username = searchByUsername; // If username keyword was provided, search by username
                }
                if (searchByEmail) {
                    $scope.advancedSearchFilter.email = searchByEmail; // If email keyword was provided, search by email
                }
                if (searchByName) {
                    $scope.advancedSearchFilter.name = searchByName; // If name keyword was provided, search by name
                }
                app.searchLimit = undefined; // Clear limit on search results
            }
            else {
                console.log('you havent entered anything!');
            }
        };

        // Function: Set sort order of results
        app.sortOrder = function (order) {
            app.sort = order; // Assign sort order variable requested by user
        };


    })


    .controller('editCtrl', function ($scope, $routeParams, User, $timeout, $mdDialog, $location) {

        var app = this;
        $scope.nameTab = 'active';
        app.phase1 = true;
        app.showEditingWindow = false;
        app.deleteAccess = false;
        $scope.currentPage = 1;
        $scope.pageSize = 3;

        //when the user is entering the edit controller (to edit a user), check if he has editing capabilities
        User.getFullUserInfo().then(function(data) {
            app.fullname = data.data.userFullName;
            app.deleteAccess = (data.data.role == 'admin'); //give delete access only if the user is admin
        }).catch(function(){
            console.log('error!');
        });


        User.getUser($routeParams.id).then(function (data) {
            if (data.data.success) {
                $scope.newName = data.data.user.name;
                $scope.newEmail = data.data.user.email;
                $scope.newUsername = data.data.user.username;
                $scope.newPermission = data.data.user.permission;
                $scope.newDateCreated = data.data.user.dateCreated;
                $scope.relevantAssignments = data.data.user.relevant_assignments;
                //TODO: get relevant assignments as real data , and not just the object id
                console.log('printing data');
                console.log(data);
                app.currentUser = data.data.user._id;

            } else {
                app.errorMsg = data.data.message;
            }
        });


        app.deleteUser = function (username) {
            User.deleteUser(username).then(function (data) {
                if (data.data.success) {
                    console.log('user deleted.');
                    $location.path('/users_management');
                } else {
                    app.showMoreError = data.data.message;
                }
            });
        };

        app.showConfirm = function (username) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to permanently delete this user?')
                .textContent('This action is irreversible.')
                .ariaLabel('Lucky day')
                .targetEvent()
                .ok('DO IT!')
                .cancel('CANCEL');
            $mdDialog.show(confirm).then(function () {
                app.deleteUser(username);
            }, function () {
                console.log('canceled delete');
            });
        };



        //each one of the phases defines the appearance of the selected tab
        app.namePhase = function () {
            $scope.nameTab = 'active';
            app.phase1 = true;
            app.phase2 = false;
            app.phase3 = false;
            app.phase4 = false;
            app.showEditingWindow = true;

            $scope.emailTab = 'default';
            $scope.usernameTab = 'default';
            $scope.permissionTab = 'default';
            app.errorMsg = false;

        }
        app.usernamePhase = function () {
            $scope.usernameTab = 'active';
            app.phase1 = false;
            app.phase2 = true;
            app.phase3 = false;
            app.phase4 = false;
            app.showEditingWindow = true;

            $scope.nameTab = 'default';
            $scope.emailTab = 'default';
            $scope.permissionTab = 'default';
            app.errorMsg = false;


        }
        app.emailPhase = function () {
            $scope.emailTab = 'active';
            app.phase1 = false;
            app.phase2 = false;
            app.phase3 = true;
            app.phase4 = false;
            app.showEditingWindow = true;

            $scope.nameTab = 'default';
            $scope.usernameTab = 'default';
            $scope.permissionTab = 'default';
            app.errorMsg = false;


        }

        app.permissionPhase = function () {
            $scope.permissionTab = 'active';
            app.phase1 = false;
            app.phase2 = false;
            app.phase3 = false;
            app.phase4 = true;
            app.showEditingWindow = true;
            $scope.nameTab = 'default';
            $scope.emailTab = 'default';
            $scope.usernameTab = 'default';
            app.errorMsg = false;

        }

        app.updateName = function (newName, valid) {
            app.errorMsg = false;
            app.disabled = true;
            var userObject = {};
            if (valid) {
                userObject._id = app.currentUser;
                userObject.name = $scope.newName;
                User.editUser(userObject).then(function (data) {
                    if (data.data.success) {
                        app.successMsg = data.data.message;
                        $timeout(function () {
                            app.nameForm.name.$setPristine();
                            app.nameForm.name.$setUntouched();
                            app.successMsg = false;
                            app.disabled = false;
                            app.showEditingWindow = false;
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

        app.updateEmail = function (newEmail, valid) {
            app.errorMsg = false;
            app.disabled = true;
            var userObject = {};
            if (valid) {
                userObject._id = app.currentUser;
                userObject.email = $scope.newEmail;
                User.editUser(userObject).then(function (data) {
                    if (data.data.success) {
                        app.successMsg = data.data.message;
                        $timeout(function () {
                            app.emailForm.email.$setPristine();
                            app.emailForm.email.$setUntouched();
                            app.successMsg = false;
                            app.disabled = false;
                            app.showEditingWindow = false;
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

        app.updateUsername = function (newUsername, valid) {
            app.errorMsg = false;
            app.disabled = true;
            var userObject = {};
            if (valid) {
                userObject._id = app.currentUser;
                userObject.username = $scope.newUsername;
                User.editUser(userObject).then(function (data) {
                    if (data.data.success) {
                        app.successMsg = data.data.message;
                        $timeout(function () {
                            app.usernameForm.username.$setPristine();
                            app.usernameForm.username.$setUntouched();
                            app.successMsg = false;
                            app.disabled = false;
                            app.showEditingWindow = false;
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
                        if (newPermission === 'user') {
                            $scope.newPermission = 'user';
                        } else if (newPermission === 'moderator') {
                            $scope.newPermission = 'moderator';

                        } else if (newPermission === 'admin') {
                            $scope.newPermission = 'admin';
                        }
                        app.showEditingWindow = false;
                        app.disabled = false;
                    }, 2000);
                } else {
                    app.errorMsg = data.data.message;
                    app.disabled = false;
                }
            });
        };
    })
    .filter('pagination', function () {
        return function (data, start) {
            return data.slice(start);
        }
    });