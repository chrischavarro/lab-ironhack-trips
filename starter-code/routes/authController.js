const express = require('express');
const authController = express.Router();
const passport = require('passport');

authController.get('/auth/facebook', passport.authenticate('facebook'));
authController.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/my-trips',
  failureRedirect: '/'
}));

module.exports = authController;
