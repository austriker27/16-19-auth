'use strict';

// ROUTER : 
const {Router} = require('express');
const httpErrors = require('http-errors');
const bearerAuthMiddleware = require('../lib/bearer-auth-middleware');
const Photograph = require('../model/photograph');

// FOR UPLOADING : 
const multer = require('multer');
const upload = multer({ dest: `${__dirname}/../temp}` });
const S3 = require('../lib/s3');

const photographRouter = module.exports = new Router();

photographRouter.post('/photographs', bearerAuthMiddleware, upload.any(), (request, response, next) => {
  if(!request.account)
    return new(new httpErrors(404, '__ERROR__ not found'));

  if(!request.body.title || request.files.length > 1 || request.files[0].fieldname !== 'photograph')
    return next(new httpErrors(400, '__ERROR__ invalid request'));

  let file = request.files[0];
  let key = `${file.filename}.${file.originalname}`;

  return S3.upload(file.path, key)
    .then(url => {
      return new Photograph({
        title : request.body.title,
        account : request.account._id,
        url,
      }).save;
    })
    .then(photograph => response.json(photograph))
    .catch(next);
});