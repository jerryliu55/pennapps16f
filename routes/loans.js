var express = require('express');
var router = express.Router();
var Loan = require('../models/loan')
var mongoose = require('mongoose')
var mongo = require('mongodb')

mongoose.Promise = global.Promise

var functions = {
  get_loans: function(req, res) {
    var db = req.db;

		db.collection('loans').find({}).toArray(function(e, docs){
			if (e) {
				res.sendStatus(400)
			} else {
				res.send(docs)
			}
	  });
  },
	post_loan: function(req, res) {
		var db = req.db;

		var newLoan = Loan({
			book_id: req.body.book_id,
			borrower: req.body.borrower,
			borrowed_on: Date.now()
		})

		newLoan.save((err, doc) => {
			if (err) {
				res.status(500).send(err)
			} else {
				res.send('created')
			}
		})
	},
	get_loan_by_id: function(req, res) {
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
	delete_loan: function(req, res) {
		var db = req.db;
		var loan_id = new mongo.ObjectId(req.params.loan_id)

		db.collection('loans').remove({
			_id: loan_id
		}, (err, result) => {
			if (err) {
				res.status(500).send(err)
			} else {
				res.send(result)
			}
		})
	}
}

router.get('/', functions.get_loans)
router.post('/', functions.post_loan)
router.get('/:loan_id', functions.get_loan_by_id)
router.delete('/:loan_id', functions.delete_loan)

module.exports = router
