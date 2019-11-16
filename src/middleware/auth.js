'use strict';

const Users = require('../models/users-model.js');
const users = new Users();
const jwt = require('jsonwebtoken');

/**
 * THis takes an ecncoded base64 string and finds a user matching that string
 * @param {string} encoded - base64 string username:password
 * @returns {object} - found user from our database
 */
const basicDecode = async (encoded) => {
  let base64 = Buffer.from(encoded, 'base64');
  let plaintext = base64.toString();
  let [username, password] = plaintext.split(':');
  let user = await users.getFromField({username});

  if(user.length){
    let isSamePassword = await user[0].comparePassword(password);
    if(isSamePassword) return user[0];
  }else{
    let newUser = await users.create({username, password});
    return newUser;
  }

  

};

const bearerDecrypt = async (token) => {
  console.log('bearer');
  try {
    let tokenData = jwt.verify(token, process.env.JWT_SECRET);
    if(tokenData && tokenData.data) return await users.get(tokenData.data.id);
  } catch (error) {
    console.error(error);
    return null;
  }

};

/**
 * This function takes in a request header authorization either bearer or basic
 * @param authorization.headers.required - Our authorization string
 * @return {object} - The found user in req.user
 * @returns {object} - The token generated from our authorizations
 */
module.exports = async (req, res, next) => {
  console.log(req.headers);

  if (!req.headers.authorization) 
    return req.authError === false ? next() : next({ status: 400, msg: 'Missing request headers' });

  let authSplitString = req.headers.authorization.split(/\s+/);
  if (authSplitString.length !== 2) return req.authError === false ? next() : next({ status: 400, msg: 'Incorrect format of request header' });

  let authType = authSplitString[0];
  let authData = authSplitString[1];
  console.log(authType);
  let user;

  if(authType === 'Basic') user = await basicDecode(authData);
  else if (authType === 'Bearer') user = await bearerDecrypt(authData);
  else return req.authError === false ? next() : next({ status: 400, msg: 'Neither Basic nor Bearer request header'});
  console.log(user);
  if(user){
    console.log('in this');
    req.user = user;
    req.token = user.generateToken(req.headers.timeout);
    return next();
  }else  return next({status: 401, msg:'User not found from credentials'});
};




