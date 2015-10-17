'use strict';

angular.module('spotifyExperimentApp')
  .controller('MainCtrl', function ($scope, $rootScope, $http, $stateParams, $location, loginService) {
    $scope.awesomeThings = [];

    $scope.searchType = 'track';
    $scope.voteText = 'Vote to Veto';
    $scope.hideMe = false;

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

    $scope.vote = function() {
      if (!$scope.activated) {
        $scope.activated = true;
        $scope.voteText = "You've Voted!";
        var fb = new Firebase('https://myspotifyapp.firebaseio.com/currentTrack');
        fb.once('value', function(snapshot) {
          var data = snapshot.val();
          fb.update({vetoCount: data.vetoCount + 1});
        });
      }
    }

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
      $http.get('https://api.spotify.com/v1/search?q=' + $scope.searchType + ':"' + $scope.query + '"&type=track&limit=30').success(function(res) {
        $scope.searchData = res;
        var ref = new Firebase('https://myspotifyapp.firebaseio.com/partiers/' + $scope.userName);
        ref.once('value', function(snapshot) {
          var data = snapshot.val();
          for (var i = 0; i < $scope.searchData.tracks.items.length; i++) {
            $scope.searchData.tracks.items[i].added = false;
            for (var j = 0; j < data.tracks.length; j++) {
              if ($scope.searchData.tracks.items[i].id === data.tracks[j]) {
                $scope.searchData.tracks.items[i].added = true;
              }
            }
          }
          $scope.$apply();
        });
        
        console.log('here', $scope.searchData);
      }).error(function(err) {
        console.log('invalid request');
      });
    };

    $scope.login = function() {
      loginService.spotifyLogin(function(data) {
        
          console.log(data);
      });
    };

    $scope.addTrack = function(trackId, i) {
      if (!$scope.searchData.tracks.items[i].added) {
        $scope.searchData.tracks.items[i].added = true;
        console.log($rootScope.userName);
        var fb = new Firebase('https://myspotifyapp.firebaseio.com/partiers/' + $rootScope.userName);
        fb.once('value', function(snapshot) {
          var data = snapshot.val();
          console.log(data);
          if (data.tracks[0] === 'empty') {
            data.tracks[0] = trackId;
          } else {
            data.tracks.push(trackId);
          }
          fb.set(data);
        });
      }
    };

    $scope.logout = function() {
      localStorage.removeItem('username');
      $rootScope.userName = null;
      $location.path('/');
    };

    var chosenByRef = new Firebase('https://myspotifyapp.firebaseio.com/currentTrack/chosenBy');
    chosenByRef.on('value', function(sn) {
      var data = sn.val();
      $scope.chosenBy = data;
    });

    var nowPlayingRef = new Firebase('https://myspotifyapp.firebaseio.com/currentTrack/trackId');
    nowPlayingRef.on('value', function(sn) {
      var data = sn.val();
      if (data && data !== '') {
        $scope.activated = false;
        $scope.voteText = 'Vote to Veto';
        console.log('here');
        $http.get('https://api.spotify.com/v1/tracks/' + data).success(function(res) {
          console.log('updated current track', res);
          $scope.currentTrack = res;
        });
      }
    })
  });
