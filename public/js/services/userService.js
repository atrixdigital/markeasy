/**
 * Created by Nir on 07/01/2017.
 */

//this is a way of organizing our code, we can go to this service throughout our application!
angular.module('userServices', [])
.factory('User' , function($http) {

    // here we will create a custom function that we can use throught our application...
    userFactory = {};

    userFactory.create = function(regData) {
        return $http.post('users/register', regData);
    };

    userFactory.getFullUserInfo = function() {
        console.log('get full info userservice');
        return $http.get('users/fullUserData');
    };

    userFactory.renewSession = function (username) {
        return $http.get('/users/renewToken/' + username);
    }

    userFactory.getPermission = function (username) {
        return $http.get('/users/permission');
    }

    userFactory.getUsers = function () {
        console.log('inside get users in services');
        return $http.get('/users/users_management');
    }

    userFactory.getUser = function (id) {
        return $http.get('/users/edit/' + id);
    }
    userFactory.deleteUser = function (username) {
        return $http.delete('/users/users_management/' + username);
    }

    userFactory.editUser = function (id) {
      return $http.put('/users/edit' , id);
    };



    console.log('testing the factory');
    return userFactory;

});
