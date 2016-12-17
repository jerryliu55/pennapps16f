var express = require('express');
var router = express.Router();
var request = require('request')
var User = require('../models/user')
var mongo = require('mongodb')
var mongoose = require('mongoose')
var async = require('async')

mongoose.Promise = global.Promise

var users = {
	get: function(req, res) {
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
	get_by_id: function(req, res) {
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
	post: function (req, res) {
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
				res.status(500).send(err)
			} else {
				res.send('created')
			}
		})	// .catch((err) => {
		//   // just need one of these
		// 	res.sendStatus(400)
		// })
	},
	get_books: function(req, res) {
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
	get_friends: function(req, res) {
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
	post_friend: function(req, res) {
		var db = req.db
		var user_id = new mongo.ObjectId(req.params.user_id)

		if (req.body.hasOwnProperty('friend_id')) {
			var friend_id = new mongo.ObjectId(req.body.friend_id)
			db.collection('users').update({_id: friend_id,},
				{$push: { 'friends' : user_id }}, // add one way
				{upsert: true},
				(err, data) => {
				if (err) {
					res.status(404).send(err)
				} else {
					db.collection('users').update({
						_id: user_id
					},
					{$push: { 'friends' : friend_id }}, // add the other way
					{upsert: true},
					function(err) {
						if (err) {
							res.sendStatus(500)
						} else {
							res.send('ok')
						}
					})
				}
			})
		} else {
			res.sendStatus(400)
		}
	},
	delete_friend: function(req, res) {
		var db = req.db
		var user_id = new mongo.ObjectId(req.params.user_id)
		var friend_id = new mongo.ObjectId(req.params.friend_id)

		User.update({_id: req.params.user_id},
		{$pull: {'friends': friend_id}}, (err, data) => {
			if (err) {
				res.status(500).send(err)
			} else {
				User.update({_id: req.params.friend_id},
				{$pull: {'friends': user_id}}, (err, data) => {
					if (err) {
						res.status(500).send(err)
					} else {
						res.send('ok')
					}
				})
			}
		})
	},
	get_catalogue: function(req, res) {
		var db = req.db
		var user_id = new mongo.ObjectId(req.params.user_id)

		db.collection('users').find({
			_id: user_id
		}, {limit: 1}).toArray((err, docs) => {
			if (docs.length !== 0) {
				db.collection('books').find({
					'owner': {$in: docs[0].friends}
				}).toArray((err, books) => {
					if (err) {
						res.status(500).send(err)
					} else {
						async.map(books, (book, callback) => {
							var book_owner = new mongo.ObjectId(book.owner)
							db.collection('users').find({_id: book_owner}, {
								limit: 1,
								fields: ['email', 'first_name', 'last_name']
							}).toArray((err, docs) => {
								book.owner_info = docs[0]
								callback(null, book)
							})
						}, (err, result) => {
							if (err) {
								res.status(500).send(err)
							} else {
								res.send(books)
							}
						})						
					}
				})
			} else {
				res.sendStatus(404)
			}
		})
	},
	delete: function(req, res) {
		var self_url = req.protocol + '://' + req.get('host')
		var db = req.db;
		var user_id = new mongo.ObjectId(req.params.user_id)

		db.collection('users').remove({
			_id: user_id
		}, (err, result) => {
			if (err) {
				res.status(500).send(err)
			} else {
				db.collection('books').find({
					owner: user_id
				}, {fields: ['_id']}, (err, docs) => {
					if (err) {
						res.status(500).send(err)
					} else {
						docs.forEach((doc) => {
							request.delete(self_url + '/api/books/' + doc._id)
						})
						res.send('ok')
					}
				})
			}
		})
	}
}

module.exports = users
