var express = require('express');
var router = express.Router();
var users = require('./users')
var books = require('./books')
var loans = require('./loans')

// users
router.get('/api/users', users.get)
router.post('/api/users', users.post)
router.get('/api/users/:user_id', users.get_by_id)
router.delete('/api/users/:user_id', users.delete)
router.get('/api/users/:user_id/books', users.get_books)
router.get('/api/users/:user_id/friends', users.get_friends)
router.post('/api/users/:user_id/friends', users.post_friend)
router.get('/api/users/:user_id/catalogue', users.get_catalogue)


// books
router.get('/api/books', books.get)
router.post('/api/books', books.post)
router.get('/api/books/:book_id', books.get_by_id)
router.delete('/api/books/:book_id', books.delete)

// loans
router.get('/api/loans', loans.get)
router.post('/api/loans', loans.post)
router.get('/api/loans/:loan_id', loans.get_by_id)
router.delete('/api/loans/:loan_id', loans.delete)

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
