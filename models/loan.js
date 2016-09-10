var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = require('mongodb').ObjectID


// create a schema
var loan = new Schema({
  book_id: [{ type : ObjectId, ref: 'Book' }],
  owner: [{ type : ObjectId, ref: 'User' }],
  borrower: [{ type : ObjectId, ref: 'User' }],
  borrowed_on: Date
})

var Loan = mongoose.model('Loan', loan)

module.exports = Loan
