'use strict';

var options = {
	appkeyFile: './spotify_appkey.key',
};

var Firebase = require('firebase');
var btoa = require('btoa');
var atob = require('atob');
var async = require('async');
var spotify = require('node-spotify/build/release/spotify')(options);

var request = require('request');


// function for performing action after the spotify object is ready
var ready = function() {
	console.log('spotify is ready!');
	//buildPlaylist();
	djAsync();
};

var isPlaying;
var iterator = 0;
var userTurn;
// asyncronous loop DJ
var djAsync = function() {
	isPlaying = false;
	
	async.whilst(
		function() { return !isPlaying; },
		function(callback) {
			console.log('hello world');
			var ref = new Firebase('https://myspotifyapp.firebaseio.com/partiers/');
			ref.once('value', function(data) {
				if (data.val()) {
					var keys = Object.keys(data.val());
					if(keys.length > 0) {
						if (iterator === keys.length) {
							iterator = 0;
						}
						console.log(keys[iterator]);
						userTurn = keys[iterator];

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
								console.log('foo');
								tracks.shift();
								console.log(tracks);
							}

							//update db
							var ref2 = new Firebase('https://myspotifyapp.firebaseio.com/partiers/' + keys[iterator] + '/tracks');
							ref2.set(tracks);
						}

						iterator++;
						
					}
				}
				setTimeout(callback, 1000);
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

function resetVetoCount() {
	var fb = new Firebase('https://myspotifyapp.firebaseio.com/currentTrack/vetoCount');
	fb.set(0);
}

function updateCurrentTrackValues(currentSecond, trackId, duration, vetoCount, chosenBy, callback) {
	var fbCurrentTrack = new Firebase('https://myspotifyapp.firebaseio.com/currentTrack/');
	
	fbCurrentTrack.once('value', function(snapshot) {
		var data = snapshot.val();
		if (currentSecond) { data.currentSecond = currentSecond; }
		if (trackId) { data.trackId = trackId; }
		if (chosenBy) { data.chosenBy = chosenBy; }
		if (duration) { data.duration = duration; }
		
		fbCurrentTrack.update(data, function(success) {
			callback();
		});
	});
}

var playTimer;

function startPlayTimer(theCurrentTrack) {
	console.log(theCurrentTrack.name);
	async.whilst(
		function() { return playTimer; },
		function(callback){
			updateCurrentTrackValues(spotify.player.currentSecond, null, null, null, null, function() {
				setTimeout(callback, 200);
			});
		},
		function(err) {
			console.log('timer stopped');
		} 
	)
}


function play(trackId) {

	spotify.player.on({
		endOfTrack: function() {
			skipTrack();
		}
	});
	var track = spotify.createFromLink('spotify:track:' + trackId);
	spotify.player.play(track);
	isPlaying = true;
	updateCurrentTrackValues(0, trackId, track.duration, 0, userTurn, function() {
		playTimer = true;
		startPlayTimer(trackId);
	});

}

var fbVetoCount = new Firebase('https://myspotifyapp.firebaseio.com/currentTrack/vetoCount');

fbVetoCount.on('value', function(snapshot) {
	var data = snapshot.val();
	if (data !== 0) {
		var fb = new Firebase('https://myspotifyapp.firebaseio.com/');
		fb.once('value', function(snpsht) {
			var partiers = snpsht.val().partiers;
			if (Object.keys(partiers).length / 2 < data) {
				skipTrack();
			}
		});
	}
});

function resetCurrentTrack(callback) {
	var thisFb = new Firebase('https://myspotifyapp.firebaseio.com/currentTrack');
	thisFb.set({
		currentSecond: 0,
		vetoCount: 0,
		trackId: '',
		duration: 0,
		chosenBy: ''
	}, function(complete) {
		callback();
	});

}

var skipTrack = function() {
	spotify.player.stop();
	playTimer = false;
	isPlaying = false;
	resetCurrentTrack(function() {
		djAsync();
	});
};



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
	skipTrack();
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








