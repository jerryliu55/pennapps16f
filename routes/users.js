var express = require('express');
var router = express.Router();
var User = require('../models/user')
var mongo = require('mongodb')
var mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/test')

var functions = {
	get_users: function(req, res) {
	  var db = req.db;

		db.collection('users').find({}, {
			fields: ['_id', 'email', 'first_name', 'last_name']
		}).toArray(function(e, docs){
			if (e) {
				res.sendStatus(400)
			} else {
				res.send(docs)
			}
	  });
	},
	get_user_by_id: function(req, res) {
	  var db = req.db;

		db.collection('users').findOne({
			'_id': new mongo.ObjectId(req.params.user_id)
		}, function(e, doc) {
			if (e || doc === null) {
				res.sendStatus(404)
			} else {
				res.send(doc)
			}
	  });
	},
	post_user: function (req, res) {
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
			if (err) {
				res.send(err).status(500)
			} else {
				res.send('created')
			}
		})	// .catch((err) => {
		//   // just need one of these
		// 	res.sendStatus(400)
		// })
	},
	get_user_books: function(req, res) {
		var db = req.db
		var objectId = new mongo.ObjectId(req.params.user_id)

		db.collection('users').findOne({
			'_id': objectId
		}, function(e, doc) {
			if (e || doc === null) {
				res.status(404).send('invalid user')
			} else {
				db.collection('books').find({
					'owner': objectId
				}).toArray((err, docs) => {
					if (err) {
						res.sendStatus(404)
					} else {
						res.send(docs)
					}
				})
			}
	  })
	},
	get_user_friends: function(req, res) {
		var db = req.db
		var user_id = new mongo.ObjectId(req.params.user_id)

		db.collection('users').findOne({
			'_id': user_id
		}, (err, doc) => {
			if (err) {
				res.status(404).send('problem with user')
			} else {
				var friendIds = doc.friends
				db.collection('users').find({
					_id: {$in: friendIds}
				}, {
					fields: ['_id', 'email', 'first_name', 'last_name']
				}).toArray(function(e, docs) {
					if (e) {
						res.status(500).send('invalid user')
					} else {
						res.send(docs)
					}
			  });
			}
		})
	},
	post_user_friend: function(req, res) {
		var db = req.db
		var user_id = new mongo.ObjectId(req.params.user_id)

		if (req.body.hasOwnProperty('friend_id')) {
			var friend_id = new mongo.ObjectId(req.body.friend_id)
			db.collection('users').find({
				_id: friend_id
			}, {limit: 1}, (err, doc) => {
				if (err) {
					res.status(404).send(err)
				} else {
					db.collection('users').update({
						_id: user_id
					},
					{$push: { 'friends' : friend_id }},
					{upsert: true},
					function(err, data) {
						if (err) {
							res.sendStatus(500)
						} else {
							res.send('friend added')
						}
					})
				}
			})
		} else {
			res.sendStatus(400)
		}
	},
	get_user_catalogue: function(req, res) {
		var db = req.db
		var user_id = new mongo.ObjectId(req.params.user_id)

		db.collection('users').find({
			_id: user_id
		}, {limit: 1}).toArray((err, docs) => {
			if (docs.length !== 0) {
				console.log(docs)
				db.collection('books').find({
					'owner': {$in: docs[0].friends}
				}).toArray((err, books) => {
					if (err) {
						res.status(500).send(err)
					} else {
						res.send(books)
					}
				})
			} else {
				res.sendStatus(404)
			}
		})
	},
	delete_user: function(req, res) {
		var db = req.db;
		var user_id = new mongo.ObjectId(req.params.user_id)

		db.collection('users').remove({
			_id: user_id
		}, (err, result) => {
			if (err) {
				res.status(500).send(err)
			} else {
				res.send(result)
			}
		})
	}
}

router.get('/', functions.get_users)
router.post('/', functions.post_user)
router.get('/:user_id', functions.get_user_by_id)
router.delete('/:user_id', functions.delet_user)
router.get('/:user_id/books', functions.get_user_books)
router.get('/:user_id/friends', functions.get_user_friends)
router.post('/:user_id/friends', functions.post_user_friend)
router.get('/:user_id/catalogue', functions.get_user_catalogue)

module.exports = router
