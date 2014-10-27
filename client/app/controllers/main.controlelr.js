'use strict';

angular.module('spotifyExperimentApp')
  .controller('MainCtrl', function ($scope, $rootScope, $http, $stateParams, $location, loginService) {
    $scope.awesomeThings = [];

    $scope.searchType = 'track';

    console.log($stateParams);
    if ($stateParams.code) {
      console.log($stateParams.code);
      loginService.getToken($stateParams.code, function(token) {
        console.log('token', token);
        loginService.getMe(token, function(data) {
          console.log('got me', data);
          $scope.username = data.display_name;
        });
      });
    };

    if (localStorage.getItem('username') !== undefined) {
      $rootScope.userName = localStorage.getItem('username');
    } else {
      $location.path('/');
    }

    $scope.playing = false;

    $scope.playTrack = function(track) {
      $http({method: 'GET', url:'/api/spotify/playTrack', params:{track: track}});
    };

    $scope.pauseResume = function() {
      if (!$scope.playing) {
        $http.get('/api/spotify/pauseTrack');
      } else {
        $http.get('/api/spotify/resumeTrack');
      }
      $scope.playing = !$scope.playing;
    };

    $scope.stopTrack = function() {
      $http.get('/api/spotify/stopTrack');
    };

    $scope.search = function() {
      console.log('foo', $scope.query);
      $http.get('https://api.spotify.com/v1/search?q=' + $scope.searchType + ':"' + $scope.query + '"&type=track&limit=50').success(function(res) {
        console.log(res);
        console.log('foobar');
        $scope.searchData = res;
      }).error(function(err) {
        console.log('invalid request');
      });
    };

    $scope.login = function() {
      loginService.spotifyLogin(function(data) {
        
          console.log(data);
      });
    };

    $scope.addTrack = function(trackUri) {
      console.log($rootScope.userName);
      var fb = new Firebase('https://myspotifyapp.firebaseio.com/' + $rootScope.userName);
      fb.once('value', function(snapshot) {
        var data = snapshot.val();
        console.log(data);
        if (data.tracks[0] === 'empty') {
          data.tracks[0] = trackUri;
        } else {
          data.tracks.push(trackUri);
        }
        fb.set(data);
      });
    };

    $scope.logout = function() {
      localStorage.removeItem('username');
      $rootScope.userName = null;
      $location.path('/');
    };
  });
