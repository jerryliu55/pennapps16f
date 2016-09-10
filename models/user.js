var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = require('mongodb').ObjectID


// create a schema
var user = new Schema({
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  first_name: {type: String, required: true},
  last_name: {type: String, required: true},
  friends: [{ type : ObjectId, ref: 'User' }],
  created_at: Date
})

var User = mongoose.model('User', user)

module.exports = User
