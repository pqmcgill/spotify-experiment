'use strict';

angular.module('spotifyExperimentApp')
	.factory('loginService', ['$resource', '$window', function($resource, $window) {
		return {
			spotifyLogin: function(callback) {
				//$http.get('https://accounts.spotify.com/authorize?client_id=11755ee6f71b4de2a1d95dafadc354de&response_type=code&redirect_uri=http://10.0.0.9:9000');
				// var res = $resource('/api/spotify/login', {}, {
				// 	login: {
				// 		method: 'GET'
				// 	}
				// });

				// res.login({}, function(data){
				// 	callback(data);
				// });
				console.log('redirect');
				$window.location.href = 'https://accounts.spotify.com/authorize?client_id=11755ee6f71b4de2a1d95dafadc354de&response_type=code&redirect_uri=http://localhost:9000';
			},

			getToken: function(code, callback) {
				console.log('getting Token...');
				var req = $resource('/api/spotify/getToken', {
					code: code
				});
				req.get(function(data) {
					console.log(data);
					var token = data.access_token;
					callback(token);
				});
			},

			getMe: function(token, callback) {
				console.log('getting user data...');
				var req = $resource('/api/spotify/getMe', {
					token: token
				});
				req.get(function(data) {
					console.log(data);
					callback(data);
				});
			}
		};
	}]);