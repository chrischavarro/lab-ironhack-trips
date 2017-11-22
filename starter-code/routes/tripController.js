const express = require('express');
const tripController = express.Router()
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const Trip = require('../models/trip');
const multer = require('multer');
const upload = multer({ dest: './public/uploads'});

tripController.get('/', ensureLoggedIn(), (req, res, next) => {
  Trip
    .find({})
    .exec((err, trips) => {
      if (err) {
        res.redirect('/')
      } else {
        res.render('trips/index', { trips })
      }
    })
});

tripController.get('/edit/:tripId', ensureLoggedIn(), (req, res, next) => {
  const tripId = req.params.tripId;
  Trip
    .findOne({ "_id": tripId })
    .exec((err, trip) => {
      if (err) {
        res.redirect('/my-trips')
      } else {
        res.render('trips/edit', {trip});
      }
    });
});

tripController.post('/edit/:tripId', ensureLoggedIn(), (req, res, next) => {
  const tripId = req.params.tripId;
  const { destination, description } = req.body;

    const updatedTrip = {
      destination: req.body.destination,
      description: req.body.description
    }

  Trip
    .findOneAndUpdate({ "user_id": req.user.provider_id }, updatedTrip)
    .exec((err, trip) => {
      if (err) {
        res.render('trips/edit', { message: 'An error occurred when editing your trip', trip})
      } else {
        res.redirect('/my-trips')
      }
    });
});

tripController.get('/:tripId/edit-image', ensureLoggedIn(), (req, res, next) => {
  const tripId = req.params.tripId;

  Trip
    .findOne({ "_id": tripId })
    .exec((err, trip) => {
      if (err) {
        res.redirect('/my-trips')
      } else {
        res.render('trips/edit-image', { trip })
      }
    })
})

tripController.post('/:tripId/edit-image', ensureLoggedIn(), upload.single('pic_path'), (req, res,next) => {
  const tripId = req.params.tripId;

  const updatedImage = {
    pic_path: `/uploads/${req.file.filename}`
  }

  Trip
    .findOneAndUpdate({ "_id": tripId }, updatedImage)
    .exec((err, trip) => {
      if (err) {
        res.render('trips/edit-image', { message: 'An error occurred', trip})
      } else {
        res.redirect('/my-trips')
      }
    })
})

tripController.get('/delete/:tripId', ensureLoggedIn(), (req, res, next) => {
  const tripId = req.params.tripId

  Trip
    .findOne({ "_id": tripId })
    .exec((err, trip) => {
      if (err) {
        res.render('trips/index', { message: 'An error occurred' })
      } else {
        res.render('trips/delete', { trip })
      }
    });
});

tripController.post('/delete/:tripId', ensureLoggedIn(), (req, res, next) => {
  const tripId = req.params.tripId
  console.log(tripId)
  Trip
    .findOneAndRemove({ "_id": tripId })
    .exec((err) => {
      if (err) {
        res.render('trips/index', { message: 'An error occurred' })
      } else {
        res.redirect('/my-trips')
      }
    });
});

tripController.get('/new', ensureLoggedIn(), (req, res, next) => {
  res.render('trips/new')
});

tripController.post('/new', ensureLoggedIn(), upload.single('pic_path'), (req, res, next) => {
  const { destination, description } = req.body;

  Trip
    .findOne({ "destination": req.body.destination, "user_id": req.user.provider_id })
    .exec((err, trip) => {
      if (err) {
       return res.render('trips/new', { message: 'An error occurred' });
      }
      else {
       const newTrip = new Trip({
         user_id: req.user.provider_id,
         user_name: req.user.provider_name,
         destination,
         description,
         pic_path: `/uploads/${req.file.filename}`
       });

       newTrip.save((err) => {
         if (err) {
           return res.render('trips/index', { message: 'An error occurred while trying to save your trip' })
         }
         res.redirect('/my-trips')
       });
     }
   });
});

module.exports = tripController;
