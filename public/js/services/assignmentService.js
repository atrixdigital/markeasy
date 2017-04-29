/**
 * Created by Nir on 24/01/2017.
 */
//this is a way of organizing our code, we can go to this service throughout our application!
angular.module('assignmentServices', [])
    .factory('Assignment' , function($http) {

        // here we will create a custom function that we can use throught our application...
        assignmentFactory = {};

        assignmentFactory.create = function(assignmentData) {
            return $http.post('assignments/addAssignment', assignmentData);
        };

        assignmentFactory.getAssignments = function () {
            console.log('inside get assignments in services');
            return $http.get('/assignments/getAllAssignments');
        };

        assignmentFactory.getAssignment = function (id) {
            return $http.get('/assignments/edit/' + id);
        }

        assignmentFactory.addNewError = function (assignmentId, errorData) {
            console.log('add new error inside assignment service');
            return $http.post('/assignments/addErrorToAssignment/' + assignmentId , errorData);
        }


        //anything that has to do with changing something in the assignment
        assignmentFactory.editAssignment = function (id) {
            console.log('edit assignment service');
            return $http.put('/assignments/edit' , id);
        };

        assignmentFactory.getExaminers = function () {
            console.log('inside get examiners in services');
            return $http.get('/assignments/getAllExaminers');
        };

        assignmentFactory.getAssignmentErrors = function (id) {
            console.log('inside getAssignmentErrors in services');
            return $http.get('/assignments/getAssignmentErrors/'+ id);
        };

        //get specific error by its object id...
        assignmentFactory.getSpecificError = function(id) {
            console.log('inside getting specific error by its object id!');
            return $http.get('/assignments/getSpecificError/' + id);
        };
        assignmentFactory.editSpecificError = function(id) {
            console.log('edit specific error service');
            return $http.put('/assignments/editError' , id);
        }

        // assignmentFactory.getAssignment = function (id) {
        //     return $http.get('/assignments/edit/' + id);
        // }
        assignmentFactory.deleteAssignment = function (assignmentName) {
            console.log('inside deleteAssignment in services');
            return $http.delete('/assignments/users_management/' + assignmentName);
        }
        //
        // assignmentFactory.editAssignment = function (id) {
        //     return $http.put('/assignments/edit' , id);
        // };



        console.log('testing assignments');

        return assignmentFactory;

    });