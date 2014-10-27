'use strict';

var options = {
	appkeyFile: './spotify_appkey.key',
};

var Firebase = require('firebase');
var btoa = require('btoa');
var atob = require('atob');
var async = require('async');
var spotify = require('node-spotify-0.6.0-OSX/spotify.js')(options);

var request = require('request');



// function for performing action after the spotify object is ready
var ready = function() {
	console.log('spotify is ready!');
	//buildPlaylist();
	djAsync();
};

var iterator = 0;
// asyncronous loop DJ
var djAsync = function() {
	var isPlaying = false;
	
	async.whilst(
		function() { return !isPlaying; },
		function(callback) {
			var ref = new Firebase('https://myspotifyapp.firebaseio.com/');
			ref.once('value', function(data) {
				var keys = Object.keys(data.val());
				if(keys.length > 0) {
					if (iterator === keys.length) {
						iterator = 0;
					}
					console.log(keys[iterator]);

					if (data.val()[keys[iterator]].tracks[0] !== 'empty') {
						console.log(data.val()[keys[iterator]].tracks[0]);
						var track = data.val()[keys[iterator]].tracks[0];
						var tracks = data.val()[keys[iterator]].tracks;
						
						// play track
						isPlaying = true;
						play(track);

						// check for last track in list
						if (tracks.length === 1) {
							tracks[0] = 'empty';
						} else {
							tracks.shift();
							console.log(tracks);
						}

						//update db
						var ref2 = new Firebase('https://myspotifyapp.firebaseio.com/' + keys[iterator] + '/tracks');
						ref2.set(tracks);
					}

					iterator++;
					
				}
				setTimeout(callback, 0);
			});
		},
		function(err) {
			console.log('horray!');
		}
	);
};

// watch for spotify object events
spotify.on({
	ready: ready
});

// function to build a playlist based on the user's starred tracks
// and to store the playlist in firebase
function buildPlaylist() {
	// create firebase reference
	var ref = new Firebase('https://myspotifyapp.firebaseio.com/');

	// get admin's starred Playlist
	var data = spotify.sessionUser.starredPlaylist;
	
	// wait for asynchronous data loading
	spotify.waitForLoaded([data], function(playlist) {
		// get the array of tracks from playlist
		var tracks = data.getTracks();
		
		// initialize empty array for storing track URIs
		var trackLinks = [];

		// function to asynchronously load a track from spotify
		function loadTrack(track, i, end) {
			spotify.waitForLoaded([track], function(loaded) {

				// add loaded track URI to array of URIs
				trackLinks.push(loaded.link);
				
				// if its the last track in the list, push to firebase
				if (i === end - 1) {
					// add track URI to playlist array in firebase
					ref.set({
						playlist: trackLinks
					});

					// send OK response
					res.send(200);
				}
			});
		}

		// loop through loaded playlist, and call async function
		// for loading each track
		for (var i = 0; i < tracks.length; i++) {
			loadTrack(tracks[i], i, tracks.length);
		}
		
	});

	ref.child('playlist').on('value', function(snapshot) {
		var tracks = snapshot.val();
		play(tracks, tracks.length - 1);
	});

	
}

function play(trackLink) {
	spotify.player.on({
		endOfTrack: function() {
			console.log('only once');
			djAsync();
		}
	});
	var track = spotify.createFromLink(trackLink);
	spotify.player.play(track);
}



spotify.login('pqmcgill', 'Gocolts90', false, false);


exports.playTrack = function(req, res) {

	
};

exports.pauseTrack = function(req, res) {
	spotify.player.pause();
	res.send(200);
};

exports.resumeTrack = function(req, res) {
	spotify.player.resume();
	res.send(200);
};

exports.stopTrack = function(req, res) {
	spotify.player.stop();
	res.send(200);
};

exports.getToken = function(req, res) {
	var body = {
 			grant_type: 'authorization_code',
			code: req.query.code,
			redirect_uri: 'http://localhost:9000',
			client_id: '11755ee6f71b4de2a1d95dafadc354de',
			client_secret: '9d3731b5b32b44888e49accceb790e50' 
		};
	var bodyString = JSON.stringify(body);
	var options = {
		url: 'https://accounts.spotify.com/api/token',
		method: 'POST',
		form: body,
 		json: true
	};

 	request(options,function(error,response,body){
 		res.send(body);
 		res.end();
	});
};

exports.getMe = function(req, res) {
	var options = {
		url: 'https://api.spotify.com/v1/me',
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + req.query.token
		}
	};
	request(options, function(error, response, body) {
		console.log(body);
		res.send(body);
		res.end();
	});
};








