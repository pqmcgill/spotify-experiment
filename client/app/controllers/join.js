'use strict';

angular.module('spotifyExperimentApp')
	.controller('JoinCtrl', function($scope, $rootScope, $location, $firebase, firebaseFactory) {
		if (localStorage.getItem('username')) {
			$rootScope.userName = localStorage.getItem('username');	
			console.log($rootScope.userName);
			$location.path('/main');
		}

		$scope.joinParty = function() {
			var fb = new Firebase('https://myspotifyapp.firebaseio.com/partiers');
			var playlist = {tracks: ["empty"]};
			var data = {};
			data[$scope.signupName] = playlist;
			fb.update(data);
			// fb.transaction(function(data) {
			// 	var playlist = {tracks: ["empty"]};
			// 	data = {};
			// 	data[$scope.signupName] = playlist;
			// 	return data;
			// });
			$rootScope.userName = $scope.signupName;
			localStorage.setItem('username', $scope.signupName);
			console.log($rootScope.userName);
			$location.path('/main');
		}
	});