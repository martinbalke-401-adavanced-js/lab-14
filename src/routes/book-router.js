'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const Books = require('../models/books-model');
const books = new Books();

/**
 * @route GET /books
 * @group Books 
 */
router.get('/books', auth, async (req, res, next) => {
  let allbooks = await books.getFromField({});
  let filteredBooks = [];
  allbooks.forEach(book => {
    if(book.auth.includes(req.user.role)) filteredBooks.push({Title: book.title, Author: book.author});
  });
  if(filteredBooks.length) return res.status(200).json(filteredBooks);
  else next({status: 403, msg: 'No books found'});
});

/**
 * @route POST /books
 * @group Books
 */
router.post('/books', auth, async (req, res, next) => {
  if(req.user.can('create')){
    try {
      await books.create(req.body);
      res.status(200).json('You created a book!');
    } catch (error) {
      next({status: 400, msg: error.name});
    }
  } 
  else next({status: 403, msg: 'You cannot create a booke'});
});
/**
 * @route PATCH /books/:id
 * @group Books
 */
router.patch('/books/:id', auth, async (req, res, next) => {
  if(req.user.can('update') !== true) return next({status: 403, msg: 'You cannot update books'});
  
  let book = await books.get(req.params.id);
  if(book && book.id){
    let  newBookData = {...{
      title: book.title,
      author: book.author,
      auth: book.auth,
    }, ...req.body};
    try {
      await books.update(req.params.id, newBookData);
      res.status(200).json('Successfully updated book');
    } catch (error) {
      console.error(error);
      next({status: 400, msg: 'Unabel to update'});
    }
  }else next({status: 404, msg: 'Cannot find this book'});
});
/**
 * @route PUT /books/:id
 * @group Books
 */
router.put('/books/:id', auth, async (req, res, next) => {
  if (req.user.can('update') !== true) return next({ status: 403, msg: 'You cannot update books' });
  let book = await books.get(req.params.id);
  if (book && book.id) {
    let newBookData = {
      ...{
        title: null,
        author: null,
        auth: [],
      }, ...req.body,
    };
    try {
      await books.update(req.params.id, newBookData);
      res.status(200).json('Successfully updated book');
    } catch (error) {
      console.error(error);
      next({ status: 400, msg: 'Unabel to update' });
    }
  } else next({ status: 404, msg: 'Cannot find this book' });
});

module.exports = router;
