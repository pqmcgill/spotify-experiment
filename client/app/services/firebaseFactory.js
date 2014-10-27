'use strict';

angular.module('spotifyExperimentApp')

	// Factory for handling all db related functions
	.factory('firebaseFactory', function($firebase, $rootScope) {
		return {

			// performs the logout function, and deletes the user from the db
			logout: function(callback) {
				var fb = new Firebase('https://myspotifyapp.firebaseio.com/' + $rootScope.userName);
				fb.remove();
				callback();
			}
		};
	});