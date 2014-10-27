'use strict';

angular.module('spotifyExperimentApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'firebase'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
    $httpProvider.defaults.useXDomain = true;
    
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });