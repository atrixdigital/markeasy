angular.module('pdfModule', ['pdf'])
.controller('pdfController', function($scope,$timeout) {
		
			$scope.pdfUrl = '/sample.pdf';
			$scope.pdfName = 'test';
			$scope.scroll = 0;
			$scope.loading = 'loading';

			$scope.getNavStyle = function(scroll) {
				if(scroll > 100) return 'pdf-controls fixed';
				else return 'pdf-controls';
			}

			$scope.onError = function(error) {
				console.log(error);
			}

			$scope.onLoad = function() {
				$scope.loading = '';
			}

			$scope.onProgress = function (progressData) {
				console.log(progressData);
			};
			/*
			//if pdf has password
			$scope.onPassword = function (updatePasswordFn, passwordResponse) {
			if (passwordResponse === PDFJS.PasswordResponses.NEED_PASSWORD) {
							updatePasswordFn($scope.pdfPassword);
			} else if (passwordResponse === PDFJS.PasswordResponses.INCORRECT_PASSWORD) {
							console.log('Incorrect password')
			}
			};
			*/
			
});