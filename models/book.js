var mongoose = require('mongoose')
var Schema = mongoose.Schema
// var ObjectId = require('mongodb').ObjectID


// create a schema
var book = new Schema({
  title: {type: String, required: true},
  author: {type: String, required: true},
  owner: {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  available: {type: Boolean, required: true},
  added: Date
})

var Book = mongoose.model('Book', book)

module.exports = Book
