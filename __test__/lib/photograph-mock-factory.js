'use strict';

const faker = require('faker');
const accountMockFactory = require('./account-mock-factory');
const Photograph = require('../../model/photograph');

const photographMockFactory = module.exports = {};

photographMockFactory.create = () => {
  let mock = {};
  return accountMockFactory.create()
    .then(accountMock => {
      mock.accountMock = accountMock;
      return new Photograph({
        account : accountMockFactory.account._id,
        title : faker.lorem.words(2),
        url : faker.random.image(),
      }).save();
    })
    .then(photograph => {
      mock.photograph = photograph;
      return mock;
    });
};

photographMockFactory.remove = () => {
  return Promise.all([
    accountMockFactory.remove(),
    Photograph.remove({}),
  ]);
};
