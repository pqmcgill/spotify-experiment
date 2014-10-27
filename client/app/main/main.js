'use strict';

angular.module('spotifyExperimentApp')
  .config(function ($stateProvider) {
    $stateProvider
    	.state('mainAuth', {
      	url: '/?code',
      	templateUrl: 'app/partials/join.html',
      	controller: 'JoinCtrl'
      })
      .state('join', {
        url: '/',
        templateUrl: 'app/partials/join.html',
        controller: 'JoinCtrl'
      })
      .state('main', {
        url: '/main',
        templateUrl: 'app/partials/main.html',
        controller: 'MainCtrl'
      })
      .state('callback', {
     	url: '/callback',
     	templateUrl: 'app/partials/loggedin.html',
     	controller: 'MainCtrl'
      });
  });