//this controller is responsible for the user authentication

angular.module('MainController', ['authServices', 'userServices'])
    .controller('MainCtrl', function ($scope, Auth, $timeout, $location, $rootScope, $window, $interval, $route, User, AuthToken) {

        // the main controller lifecycle, is throughout all the application life ,
        // that is why the user session and token will be handled in here

        var app = this;

        //gonna hide the html until its true
        app.loadme = false;

        //set clock up
        $scope.today = new Date();

        //check for new time every second
        $interval(function () {
            $scope.today = new Date();

        }, 1000);

        app.checkSession = function () {
            if (Auth.isLoggedIn()) {
                app.checkingSession = true;
                var interval = $interval(function () {
                    var token = $window.localStorage.getItem('token');
                    if (token === null) {
                        $interval.cancel(interval);
                    } else {
                        //angular way to take a token and convert it to a time stamp (and then compare to local time if desired)
                        self.parseJwt = function (token) {
                            var base64Url = token.split('.')[1];
                            var base64 = base64Url.replace('-', '+').replace('_', '/');
                            return JSON.parse($window.atob(base64));
                        }
                        var expiredTime = self.parseJwt(token);
                        var timeStamp = Math.floor(Date.now() / 1000);

                        var timeCheck = expiredTime.exp - timeStamp;
                        // console.log(timeCheck);
                        if (timeCheck <= 25) {
                            console.log('token has expired');
                            showModal(1);
                            $interval.cancel(interval);
                        }

                    }
                }, 2000);
            }
        };

        app.checkSession();

        var showModal = function (option) {
            app.choiseMade = false;
            app.modalHeader = undefined;
            app.modalBody = undefined;
            app.hideButton = false;
            if (option === 1) {
                //warning before auto logout
                app.modalHeader = 'timeout warning';
                app.modalBody = 'your session will expire in 5 minutes, Would you like to renew your session?';
                $("#myModal").modal({backdrop: "static"});
            }
            else if (option === 2) {
                //logout portion
                app.hideButton = true;
                Auth.logout();
                app.modalHeader = 'logging out';
                app.modalBody = 'bye bye.';

                $("#myModal").modal({backdrop: "static"});
                $timeout(function () {
                    Auth.logout();
                    $location.path('/login');
                    hideModal();
                    $window.location.reload();

                }, 2000);


            }
            $timeout(function () {
                if (!app.choiseMade) {
                    console.log('loggedOut');
                    Auth.logout();
                    $window.location.reload();
                    hideModal();
                }
            }, 4000);


        }

        app.renewSession = function () {
            app.choiseMade = true;
            User.renewSession(app.username).then(function (data) {
                if (data.data.success) {
                    console.log('session has been renewed');
                    AuthToken.setToken(data.data.token);
                    app.checkSession();
                } else {
                    app.modalBody = data.data.message;
                }
            });
            hideModal();
        };

        app.endSession = function () {
            app.choiseMade = true;
            console.log('session has ended');
            hideModal();
            $timeout(function () {
                showModal(2);
            }, 1000);
        };

        var hideModal = function () {
            $('#myModal').modal('hide');
        };

        $rootScope.$on('$routeChangeStart', function () {
            //anytime a view change is evoked its gonna lead to that function

            if (!app.checkingSession)
                app.checkSession();


            if (Auth.isLoggedIn()) {
                console.log('Success: user is logged in ');
                app.isLoggedIn = true;
                Auth.getUser().then(function (data) {
                    console.log(data.data._json);
                    app.username = data.data.username;
                    app.fullname = data.data.name;
                    app.useremail = data.data.email;
                    User.getPermission().then(function (data) {
                        if (data.data.permission == 'admin' || data.data.permission === 'moderator') {
                            app.authorized = true;
                            app.loadme = true;
                        } else {
                            app.loadme = true;
                        }
                    });

                });
            } else {

                console.log('Failure: user is not logged in.. ');
                app.username = '';

                app.isLoggedIn = false;
                app.loadme = true;
                if ($location.hash() == '_=_')
                    $location.hash(null);

            }
        });

        this.facebook = function () {
            $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/facebook';
        };

        this.doLogin = function () {
            console.log('clicked login');
            app.loading = true;
            app.errorMsg = false;

            Auth.login(app.loginData).then(function (data) {
                if (data.data.success) {
                    app.loading = false;
                    app.successMsg = data.data.message + ' Redirecting to profile page';
                    $timeout(function () {
                        $location.path('/profile');
                        //clear the form and the message
                        app.loginData = '';
                        app.successMsg = false;
                        app.checkSession();
                    }, 2000);

                } else {
                    app.loading = false;
                    app.errorMsg = data.data.message;
                }
            });
        };
        //a function to logout a user by deleting his token
        app.logout = function () {
            showModal(2);
            $route.reload();

        }
    });