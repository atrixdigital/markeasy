var app = angular.module('appRoutes', ['MainController', 'ngAnimate']).config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    console.log('inside appRoutes');
    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html',		// home page
        })
        .when('/login', {
            templateUrl: 'views/users/login.html',
            authenticated: false

        })
        .when('/register', {
            templateUrl: 'views/users/register.html',
            controller: 'RegisterController',
            controllerAs: 'register',
            authenticated: false
        })
        .when('/about', {
            templateUrl: 'views/about.html',
        })
        .when('/profile', {
            templateUrl: 'views/users/profile.html',
            controller: 'ProfileController',
            controllerAs: 'profile',
            authenticated: true
        })
        .when('/logout', {
            templateUrl: 'views/users/logout.html',
            authenticated: true
        })
        .when('/facebook/:token', {
            templateUrl: 'views/users/social.html',
            controller: 'facebookCtrl',
            controllerAs: 'facebook',
            authenticated: false
        })
        .when('/facebookerror', {
            templateUrl: 'views/users/login.html',
            controller: 'facebookCtrl',
            controllerAs: 'facebook',
            authenticated: false
        })
        .when('/users_management', {
            templateUrl: 'views/users_management/management.html',
            controller: 'managementCtrl',
            controllerAs: 'management',
            authenticated: true,
            permission: ['admin', 'moderator']
        })
        .when('/edit/:id', {
            templateUrl: 'views/users_management/edit_user.html',
            controller: 'editCtrl',
            controllerAs: 'edit',
            authenticated: true,
            permission: ['admin', 'moderator']
        })
        .when('/editAssignment/:id', {
            templateUrl: 'views/assignments/edit_assignment.html',
            controller: 'editAssignmentCtrl',
            controllerAs: 'edit',
            authenticated: true,
            permission: ['admin', 'moderator']
        })
        .when('/editError/:id', {
            templateUrl: 'views/assignments/edit_error.html',
            controller: 'editErrorCtrl',
            controllerAs: 'edit',
            authenticated: true,
            permission: ['admin', 'moderator']
        })
        .when('/search', {
            templateUrl: '/views/users_management/search.html',
            controller: 'managementCtrl',
            controllerAs: 'management',
            authenticated: true,
            permission: ['admin', 'moderator']
        })
        .when('/assignments', {
            templateUrl: '/views/assignments/assignments.html',
            controller: 'assignmentCtrl',
            controllerAs: 'assignments',
            authenticated: true,
        })
        .when('/add_assignment', {
            templateUrl: '/views/assignments/add_assignment.html',
            controller: 'addAssignmentCtrl',
            controllerAs: 'addAssignment',
            authenticated: true,
            permission: ['admin', 'moderator']
        })
        .when('/submissions', {
            templateUrl: '/views/submissions/submissions.html',
            controller: 'submissionCtrl',
            controllerAs: 'submission',
            authenticated: true,
        })
        .when('/submit_assignment/:id', {
            templateUrl: '/views/submissions/submit_assignment.html',
            controller: 'submitAssignmentCtrl',
            controllerAs: 'submission',
            authenticated: true,
        }).when('/check_submission/:id', {
            templateUrl: '/views/submissions/view_submissions.html',
            controller: 'submitAssignmentCtrl',
            controllerAs: 'submission',
            authenticated: true,
        })
        .otherwise({redirectTo: 'views/home.html'});

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

}]);



app.run(['$rootScope', 'Auth', '$location', '$route' , 'User', function ($rootScope, Auth, $location, $route, User) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {

        //only perform if user vesited a route listed above
        if (next.$$route !== undefined) {
            //check if authentication is required on the route
            if (next.$$route.authenticated == true) {
                console.log('need to be authenticated');
                if (!Auth.isLoggedIn()) {
                    //prevent the user from going to that route
                    console.log('using prevent path');
                    $route.reload();
                    event.preventDefault();
                    $location.path('/');
                } else if (next.$$route.permission) {
                    User.getPermission().then(function (data) {
                       console.log(data);
                       if(next.$$route.permission[0] !== data.data.permission) {
                           //this will pick up if the permission is required
                           if(next.$$route.permission[1] !== data.data.permission) {
                               //no permissions at all
                               console.log('you had no permission sorry.');
                               event.preventDefault();
                               $location.path('/');
                           }
                       }
                    });
                }
            } else if (next.$$route.authenticated == false) {
                //check if authentication is not required, make sure is not logged in
                if (Auth.isLoggedIn()) {
                    //if the user is logged in he can't go to the register for example..
                    event.preventDefault();
                    $location.path('/');
                }
                console.log('need to be authenticated');
            } else {
                console.log("authentication don't matter");
            }
        }


    });
}]);

