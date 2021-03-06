var express = require('express');
var router = express.Router();
var Loan = require('../models/loan')
var mongoose = require('mongoose')
var mongo = require('mongodb')

mongoose.Promise = global.Promise

var loans = {
  get: function(req, res) {
    var db = req.db;

		db.collection('loans').find({}).toArray(function(e, docs){
			if (e) {
				res.sendStatus(400)
			} else {
				res.send(docs)
			}
	  });
  },
	post: function(req, res) {
		var db = req.db
		var book_id = new mongo.ObjectId(req.body.book_id)
		var borrower = new mongo.ObjectId(req.body.borrower)

		var newLoan = Loan({
			book_id: book_id,
			borrower: borrower,
			borrowed_on: Date.now()
		})

		newLoan.save((err, doc) => {
			if (err) {
				res.status(500).send(err)
			} else {
				db.collection('books').update({
					_id: book_id
				},
				{$set: {'available': false}},
				(err, data) => {
					if (err) {
						res.status(500).send(err)
					} else {
						res.send('ok')
					}
				})
			}
		})
	},
	get_by_id: function(req, res) {
		var db = req.db;
		var loan_id = new mongo.ObjectId(req.params.loan_id)

		db.collection('loans').find({
			_id: loan_id
		}, {
			limit: 1
		}).toArray(function(e, docs) {
			console.log(docs)
			if (e) {
				res.sendStatus(404)
			} else {
				res.send(docs[0])
			}
	  });
	},
	delete: function(req, res) {
		var db = req.db;
		var loan_id = new mongo.ObjectId(req.params.loan_id)

		db.collection('loans').find({
			_id: loan_id
		}, {limit:1}).toArray((err, docs) => {
			if (err) {
				res.status(500).send(err)
			} else {
				var book_id = new mongo.ObjectId(docs[0].book_id)
				db.collection('books').update({
					_id: book_id
				},
				{$set: {'available': true}},
				(err, data) => {
					if (err) {
						res.status(500).send(err)
					} else {
						res.send('book available')
					}
				})
			}
		})
	}
}

module.exports = loans
