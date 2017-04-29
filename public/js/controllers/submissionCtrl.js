/**
 * Created by Nir on 08/02/2017.
 */
/**
 * Created by Nir on 23/01/2017.
 * this controller will handle submissions
 */


//directives goes in the dependency and the service goes into the function cause we use it inside the function.

angular.module('submissionController', ['userServices', 'assignmentServices' ,'ngMaterial', 'pdf','uploadFileService', 'fileModelDirective', 'submissionServices'])
    .controller('submissionCtrl', function ($scope, User, Assignment, $routeParams, uploadFile, $timeout) {

        console.log('testing submission controller');
        $scope.file = {};
        $scope.message = false;
        $scope.alert = '';
        $scope.default = 'https://thebenclark.files.wordpress.com/2014/03/facebook-default-no-profile-pic.jpg';

        //getting users info so that we can get his id
        User.getFullUserInfo().then(function(data) {
            console.log('inside function');
            app.fullname = data.data.userFullName;
            app.role = data.data.role;
            app.id = data.data._id;
            $scope.id = data.data._id;
            $scope.relevant_assignments = data.data.relevant_assignments;
            console.log($scope.id);
        }).catch(function(){
            console.log('error!');
        });




    }).controller('submitAssignmentCtrl', function ($scope,$http,pdfDelegate, User, Assignment, $routeParams, uploadFile, $timeout,Submission,$location) {




$scope.loadNewFile = function(url){
   $scope.pdfUrl = '../test.pdf';
}



    Assignment.getAssignment($routeParams.id).then(function (data) {
        if(data.data.success) {
            console.log('great success!!');
            //console.log(JSON.stringify(data));
            $scope.assignmentName = data.data.assignment.assignment_name;
            $scope.dueDate = data.data.assignment.due_date;

        }else {
            console.log('no success!');
        }
    });
    //getting users info to save the path of submitted assignment in database
    User.getFullUserInfo().then(function(data) {
        console.log('inside function');
        app.fullname = data.data.userFullName;
        app.role = data.data.role;
        app.id = data.data._id;
        $scope.id = data.data._id;
        console.log($scope.id);
    }).catch(function(){
        console.log('error!');
    });
   // ++++++++++++++++++++++++++++++PDF++++++++++++++++++++++++++++++++++++
   // ++++++++++++++++++++++++++++++PDF++++++++++++++++++++++++++++++++++++
   // ++++++++++++++++++++++++++++++PDF++++++++++++++++++++++++++++++++++++
    // $scope.pdfUrl = '/sample.pdf';
    // $scope.pdfName = 'test';
    // $scope.scroll = 0;
    // $scope.loading = 'loading';

    // $scope.getNavStyle = function(scroll) {
    //     if(scroll > 100) return 'pdf-controls fixed';
    //     else return 'pdf-controls';
    // }

    // $scope.onError = function(error) {
    //     console.log(error);
    // }

    // $scope.onLoad = function() {
    //     $scope.loading = '';
    // }

    // $scope.onProgress = function (progressData) {
    //     console.log(progressData);
    // };
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    $scope.UploadPdf = function() {
        console.log('upload photo clicked yay!');

        $scope.uploading = true;
        //now we will use the service function to upload the file. its expecting a file.
        uploadFile.upload($scope.file).then(function(data) {
            if (data.data.success) {
                $scope.uploading = false;
                $scope.alert = 'alert alert-success';
                $scope.message = data.data.message;
                $scope.file = data.data.path;
                console.log($scope.file);

            } else {
                $scope.uploading = false;
                $scope.alert = 'alert alert-danger';
                $scope.message = data.data.message;
                $scope.file = data.data.path;
                console.log($scope.file);

            }
        });
    };

    $scope.pdfChanged = function(files) {
        if (files.length > 0 && files[0].name.match(/\.(pdf)$/)) {
            $scope.uploading = true;
            var file = files[0];
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = function(e) {
                $timeout(function() {
                    $scope.thumbnail = {};
                    $scope.thumbnail.dataUrl = e.target.result;
                    $scope.uploading = false;
                    $scope.message = false;
                });
            };
        } else {
            $scope.thumbnail = {};
            $scope.message = false;
        }
    };




    this.submitAssignment = function (submissionData) {
        console.log('submit assignment clicked yay! submission data is:');
        console.log(JSON.stringify(submissionData));
        submissionData.file_path = $scope.file;
        console.log((submissionData));
        Submission.create(submissionData);

        //redirects to submission page after submission
        $timeout(function() {
            $location.path('/submissions');
        } , 2000);

    }
});
