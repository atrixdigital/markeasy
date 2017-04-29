/**
 * Created by Nir on 24/02/2017.
 */


/*
 in the submission service we will provide access to http requests such as submitting new assignments,
 and mainly testing capabilities like
 */
angular.module('submissionServices', [])
    .factory('Submission' , function($http) {

        // here we will create a custom function that we can use thought our application...
        submissionFactory = {};

        submissionFactory.create = function(submissionData) {
            console.log("before posting");
            return $http.post('/submissions/addSubmission', submissionData);
            console.log("After posting");

        };

        return submissionFactory;

    });