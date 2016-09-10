var express = require('express');
var router = express.Router();
var Loan = require('../models/loan')
var mongoose = require('mongoose')

mongoose.Promise = global.Promise

router.get('/', (req, res) => {
  res.send('loans')
})

module.exports = router
