'use strict';

angular.module('spotifyExperimentApp')
  .controller('NavbarCtrl', function ($scope, $location, $rootScope, firebaseFactory) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }];

    $scope.isCollapsed = true;

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.logout = function() {
      firebaseFactory.logout(function() {
        localStorage.removeItem('username');
        $rootScope.userName = null;
        $location.path('/');
      });
    };
  });