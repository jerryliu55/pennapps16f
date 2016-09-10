var express = require('express');
var router = express.Router();
var Book = require('../models/book')
var mongo = require('mongodb')
var mongoose = require('mongoose')

mongoose.Promise = global.Promise

router.get('/', (req, res) => {
  var db = req.db

  db.collection('books').find({}, {}).toArray(function(e, docs){
		console.log(docs)
		if (e) {
			res.sendStatus(400)
		} else {
			res.send(docs)
		}
  });
})

router.post('/', (req, res) => {
  var db = req.db
  // check request has owner property and that it is a valid user
  if (req.body.hasOwnProperty('owner')) {
    var objectId = new mongo.ObjectId(req.body.owner)
    db.collection('users').findOne({
      '_id': objectId
    }, (err, doc) => {
      console.log(err)
      if (doc !== null) {
        // then the owner is valid - now we can save to database
        // create a new book
      	var newBook = new Book({
      	  title: req.body.title,
      	  author: req.body.author,
      		owner: objectId,
      		added: Date.now()
      	});

      	newBook.save((err, doc) => {
      		if (err) {
      			res.status(500).send(err)
      		} else {
      			res.send('created')
      		}
      	})
      } else {
        res.sendStatus(400)
      }
    })
  } else {
    res.sendStatus(400)
  }
})

module.exports = router
