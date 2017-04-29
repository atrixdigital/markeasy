/**
 * Created by Nir on 07/01/2017.
 */
angular.module('RegisterCtrl', ['userServices']).controller('RegisterController', function($scope, $http, $location, $timeout, User) {

    var app = this;

    this.regUser = function (regData) {

        console.log('form submitted');
        //after the creation of service I can reference specific methods of it
        User.create(app.regData).then(function (data){

            app.loading = true;
            app.errorMsg = false;
            console.log(data.data.success);
            console.log(data.data.message);

            if(data.data.success) {
                 app.successMsg = data.data.message + ' please login now';
                 app.loading = false;
                 //to make it look a bit better I added a delay
                 //TODO : add markeasy animation small gif
                 $timeout(function() {
                     $location.path('/login');
                 } , 2000);
                //create success message
                //redirect to homepage
            } else {
                //create error message
                app.errorMsg = data.data.message;
                app.loading = false;

            }
        });

    };


})

.controller('facebookCtrl' , function($routeParams, Auth, $location, $window) {
    //set the token if there is no error
    if($window.location.pathname == '/facebookerror')
    {
        //error here
        app.errorMsg = 'facebook email not found in database! register your email first';
    }else {
        Auth.facebook($routeParams.token);
        $location.path('/profile');
    }

});