'use strict';

const fs = require('fs-extra');
const aws = require('aws-sdk');
const amazonS3 = new aws.S3();

const s3 = module.exports = {};

s3.upload = (path, key) => {
  let uploadOptions = {
    Bucket : process.env.AWS_BUCKET,// must be UPPER case first letter!!
    Key : key, // name of file on S3
    ACL : 'public-read', // gives everyone access to read files
    Body : fs.createReadStream(path), // path is local path
  };
  return amazonS3.upload(uploadOptions)
    .promise() // makes it return a promise, AWS thing
    .then(response => { // amazon response
      return fs.remove(path)
        .then(() => response.Location);  // location at AWS must be capital
    })
    .catch(error => {
      return fs.remove(path)
        .then(() => Promise.reject(error));
    });
};

s3.remove = (key) => {
  let removeOptions = {
    Key : key,
    Bucket : process.env.AWS_BUCKET,
  };
  return amazonS3.deleteObject(removeOptions).promise(); // returns promise per AWS docs
};