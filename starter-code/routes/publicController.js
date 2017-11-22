const express = require('express');
const publicController = express.Router();
const Trip = require('../models/trip');

publicController.get('/profile/:profileId', (req, res, next) => {
  const profileId = req.params.profileId;

  Trip
    .find({ "user_id" : profileId })
    .exec((err, trips) => {
      if (err) {
        res.render('index', { message: 'An error occurred' })
      } else {
        const profileName = trips[0].user_name
        res.render('profiles/show', { trips, profileName })
      }
    });
});

publicController.get('/trips/:tripId', (req, res, next) => {
  const tripId = req.params.tripId;

  Trip
    .findOne({ "_id" : tripId })
    .exec((err, trip) => {
      if (err) {
        res.render('index', { message: 'An error occurred' })
      } else {
        res.render('trips/show', { trip })
      };
    });
});

module.exports = publicController
