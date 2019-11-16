'use strict';

const express = require('express');
const router = express.Router();
const modelFinder = require('../middleware/model-finder.js');
const auth = require('../middleware/auth');
const preventAuthErrors = require('../middleware/prevent-auth-errors');

router.param('model', modelFinder.load);

/**
 * @route GET /model/:model
 * @group model routes - Routes specific to model data
 * @param {string} model.params.required - The name of the model you're trying to acces
 * @security bearerAuth (optional)
 * @returns {object} 200 - A count of the records in a model. If the user is an admin it returns the actual collection data
 * @returns {Error} 500
 */
router.get('/model/:model', preventAuthErrors, auth, async (req, res, next) => {
  if(!req.model) next({status: 404, msg: 'Cannot find requested model'});
  let records = await req.model.getFromField({});
  let recordCount = records.length;
  let resData = {
    model: req.params.model,
    count: recordCount,
  };
  if(req.user && req.user.role === 'admin') {
    console.log('here');
    resData.records = records;

  }

  res.status(200).json(resData);

});

/**
 * This route returns a single record inside of a specified model. Only accesible by users with the admind role
 * @route GET model/:model/:id
 * @group model routes - Routes specific to model data
 * @param {string} model.params.required - The name of the model we want to access 
 * @param {string} id.params.required - The ID of the specific record we are trying to access
 * @returns {object} 200 - The record we found 
 * @returns {Error} 404 - Unable to find record by ID 
 */
router.get('/model/:model/:id', auth, async (req, res, next) => {
  if(req.user && req.user.role === 'admin'){
    let record = await req.model.get(req.params.id);
    
    if(record && record._id)res.status(200).json(record);
    else next ({status: 404, msg: 'Unable to find record'});
  }else next({status: 403, msg: 'Forbidden to access this route'});
  
});

module.exports = router;
