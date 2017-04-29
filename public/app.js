angular.module('markEasy' , ['ngRoute', 'ngMaterial' , 'ui.bootstrap' ,'appRoutes', 'MainController', 'managementController', 'assignmentController',
    'submissionController','pdfModule', 'RegisterCtrl', 'userServices' , 'assignmentServices', 'uploadFileService', 'authServices', 'ProfileCtrl', 'fileModelDirective',
    'ngAnimate','pdf']).config(function($httpProvider) {
        //this is configuring the application to intercept all http requests with this factory
        $httpProvider.interceptors.push('AuthInterceptors');
});

