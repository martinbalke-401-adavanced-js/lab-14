'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

/**
 * This route allows users to sign in using a username and passs
 * @route GET /signup
 * @group Auth - Signin/Signup routes
 * @param {string} authorization.headers.required - A basic auth string containing the username and password
 * @returns {object} 200 - The bearer token
 */
router.post('/signup', auth, (req, res, next) => {});

/**
 * This route allows users to sign in using a username and pass
 * @route GET /signin
 * @group Auth - Signin/Signup routes
 * @param {string} authorization.headers.required - A basic auth string containing the username and password
 * @returns {object} 200 - The bearer token
 */
router.post('/signin', auth, (req, res, next) => {
  res.status(200).json({token: 'Bearer ' + req.token});
});

module.exports = router;
