var express = require('express');
var router = express.Router();
var User = require('../models/user')
var mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.createConnection('mongodb://localhost:27017/test')


/* GET all users */
router.get('/', function(req, res) {
  var db = req.db;

	db.collection('users').find({}, {}).toArray(function(e, docs){
		console.log(docs)
		if (e) {
			res.sendStatus(400)
		} else {
			res.send(docs)
		}
  });
});

router.post('/', (req, res) => {
	// create a new user
	var newUser = new User({
	  email: req.body.email,
	  password: req.body.password,
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		friends: [],
		created_at: Date.now()
	});

	newUser.save((err, doc) => {
		console.log('done saving')
		if (err) {
			res.send(err).status(500)
		} else {
			res.send('created')
		}
	})	// .catch((err) => {
	//   // just need one of these
	// 	res.sendStatus(400)
	// })
})

router.get('/:id/books', (req, res) => {
	var db = req.db

	db.collection('books').find({
		'owner': req.params.id
	}).toArray((err, docs) => {
		if (err) {
			res.sendStatus(404)
		} else {
			res.send(docs)
		}
	})
})

// router.post('/:id/books', (req, res) => {
// 	var db = req.db
//
// 	db.collection('users').find({
// 		'_id': req.params.id
// 	})
// })

router.get('/:id/friends', (req, res) => {

})

router.post('/:id/friends', (req, res) => {

})

module.exports = router;
