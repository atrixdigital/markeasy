angular.module('ProfileCtrl', ['userServices', 'assignmentServices' ,'ngMaterial']).controller('ProfileController', function($scope, $timeout, User, Assignment) {

    var app = this;
    console.log('profile/dashboard ctrl!');

	$scope.tagline = 'This is the profile controller';
	$scope.userName = this.user;

    User.getFullUserInfo().then(function(data) {
        console.log('inside function');
        app.fullname = data.data.userFullName;
        app.role = data.data.role;
    }).catch(function(){
		console.log('error!');
    });

    Assignment.getAssignments().then( function(data){
        console.log(data.data.assignments.length);

        if (data.data.success) {
            console.log('data successsssssss');
            $scope.status = 'We have ' + data.data.assignments.length + ' open assignments';
            app.assignments = data.data.assignments;

        }
        else{
            $scope.status = 'WTF';
        }
    }).catch(function (err) {

    });



});