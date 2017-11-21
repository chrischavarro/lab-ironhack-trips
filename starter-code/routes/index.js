const express = require('express');
const index = express.Router();

index.get('/', (req, res, next) => {
  res.render('index')
})

index.get('/my-trips', (req, res, next) => {
  res.render('protected/trips');
})

module.exports = index;
