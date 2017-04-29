/**
 * Created by Nir on 14/01/2017.
 */
angular.module('authServices', [])
.factory('Auth' , function ($http, AuthToken) {

    authFactory ={};

    authFactory.login = function (loginData) {
        return $http.post('users/authenticate', loginData).then(function (data) {
            //save the token to our factory
            console.log('placed token.');
            AuthToken.setToken(data.data.token);
            return data;
        });
    };
    authFactory.isLoggedIn = function () {
        if(AuthToken.getToken()) {
            //means the user is logged in (has a token)
            return true;
        }
        else {
            return false;
        }
    };

    authFactory.facebook = function(token){
        AuthToken.setToken(token);
    };
    authFactory.logout = function () {
        AuthToken.setToken();
    };

    authFactory.getUser = function () {
        if(AuthToken.getToken()) {
            return $http.post('users/currentUser');
        } else {
            $q.reject({message : 'User has no token'});
        }
    };
        return authFactory;
})

.factory('AuthToken' , function ($window) {
    var authTokenFactory = {};

    authTokenFactory.setToken = function(token) {
        //simply put the token in the browser's local memory
        if(token) {
            //if token is provided, go ahead and set it
            $window.localStorage.setItem('token' , token);
        } else {
            $window.localStorage.removeItem('token');
        }
    };

    authTokenFactory.getToken = function() {
        //simple function to get the token
        return $window.localStorage.getItem('token');

    };
    return authTokenFactory;
})
.factory('AuthInterceptors' , function (AuthToken) {
    //this is what we gonna use to detect if a user is logged in in any request...
    var authInterceptorsFactory = {};

    authInterceptorsFactory.request = function (config) {
        var token = AuthToken.getToken();
        if(token){
            // this is how we assign the token to the headers to see if the user is logged in then we can decode it.
            config.headers['x-access-token'] = token;
        }
      return config;
    };
    return authInterceptorsFactory;

});
