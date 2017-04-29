/**
 * Created by Nir on 04/03/2017.
 */

angular.module('uploadFileService', [])

    .service('uploadFile', function($http) {
        this.upload = function(file) {
            //form data is basically key value pairs
            var fd = new FormData();
            fd.append('myfile', file.upload);
            return $http.post('/upload/', fd, {
                //unserealize the data
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            });
        };

    });