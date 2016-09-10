var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = require('mongodb').ObjectID


// create a schema
var loan = new Schema({
  book_id: { type : mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  borrower: { type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowed_on: Date
})

var Loan = mongoose.model('Loan', loan)

module.exports = Loan
