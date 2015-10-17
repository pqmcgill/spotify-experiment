'use strict';

angular.module('spotifyExperimentApp')
  .config(function ($stateProvider) {
    $stateProvider
    	.state('mainAuth', {
      	url: '/?code',
      	templateUrl: 'app/partials/kim_main.html',
      	controller: 'JoinCtrl'
      })
      .state('join', {
        url: '/',
        templateUrl: 'app/partials/kim_main.html',
        controller: 'JoinCtrl'
      })
      .state('main', {
        url: '/main',
        templateUrl: 'app/partials/kim_music.html',
        controller: 'MainCtrl'
      })
      .state('callback', {
     	url: '/callback',
     	templateUrl: 'app/partials/loggedin.html',
     	controller: 'MainCtrl'
      });
  });