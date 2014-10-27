/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

var spotify = require('./api/spotify/spotify');

module.exports = function(app) {

  // Insert routes below
  //app.use('/api/things', require('./api/thing'));
  
  app.get('/api/spotify/playTrack', spotify.playTrack);
  app.get('/api/spotify/pauseTrack', spotify.pauseTrack);
  app.get('/api/spotify/resumeTrack', spotify.resumeTrack);
  app.get('/api/spotify/stopTrack', spotify.stopTrack);
  app.get('/api/spotify/getToken', spotify.getToken);
  app.get('/api/spotify/getMe', spotify.getMe);
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
