'use strict';

process.env.PORT = 7000;
process.env.MONGODB_URI = 'mongodb://localhost/testing';
process.env.CAT_CLOUD_SECRET = 'change_this';

const superagent = require('superagent');
const server = require('../lib/server');
const accountMockFactory = require('./lib/account-mock-factory');
const photographMockFactory = require('./lib/photograph-mock-factory');


const apiURL = `http://localhost:${process.env.PORT}`;


describe('/photograph', () => {
  beforeAll(server.start);
  afterAll(server.stop);
  afterEach(photographMockFactory.remove);

  test('POST /photograph should return a 200 status code and a photograph if there are no errors', () => {
    let tempAccountMock = null;
    return accountMockFactory.create()
      .then(accountMock => {
        tempAccountMock = accountMock;
        
        return superagent.post(`${apiURL}/photograph`)
          .set(`Authorization', 'Bearer ${accountMock.token}`) 
          .field('title', 'sweet photo')
          .attach('photograph', `${__dirname}/assets/giphy.gif`)
          .then(response => {
            expect(response.status).toEqual(200);
            expect(response.body.title).toEqual('sweet photo');
            expect(response.body._id).toBeTruthy();
            expect(response.body.url).toBeTruthy();

          });
      });
  });


});