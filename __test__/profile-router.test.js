'use strict';

require('./lib/setup');

const superagent = require('superagent');
const server = require('../lib/server');
const accountMockFactory = require('./lib/account-mock-factory');
const profileMockFactory = require('./lib/profile-mock-factory');

const apiURL = `http://localhost:${process.env.PORT}`;

describe('POST /profiles', () => {
  beforeAll(server.start);
  afterAll(server.stop);
  afterEach(profileMockFactory.remove);

  test('should return a 200 and a profile if there are no errors', () => {
    let accountMock = null;

    return accountMockFactory.create()
      .then(mock => {
        accountMock = mock;
        return superagent.post(`${apiURL}/profiles`)
          .set('Authorization', `Bearer ${accountMock.token}`)
          .send({
            bio : 'I am the president',
            firstName : 'Zaphod',
            lastName : 'Beeblebrox',
          });
      })
      .then(response => {
        expect(response.status).toEqual(200);
        expect(response.body.account).toEqual(accountMock.account._id.toString());
        expect(response.body.firstName).toEqual('Zaphod');
        expect(response.body.lastName).toEqual('Beeblebrox');
        expect(response.body.bio).toEqual('I am the president');
      });
  });

  test('should return a 400 for an bad/incomplete request', () => {
    return superagent.post(`${apiURL}/profiles`)
      .send({
      })
      .then(Promise.reject)
      .catch(response => {
        expect(response.status).toEqual(400);
      });
  });

  test('should return a 401 for a bad request with a bad token or lack of token', () => {
    let accountMock = null;

    return accountMockFactory.create()
      .then(mock => {
        accountMock = mock;
        return superagent.post(`${apiURL}/profiles`)
          .set('Authorization', `Bearer fakeToken`)
          .send({
            bio : 'I am the president',
          });
      })
      .then(Promise.reject)
      .catch(response => {
        expect(response.status).toEqual(401);
      });
  });


  describe('GET /profile/:id', () => {
    // TODO : write test for 200 on /profiles/:id
    test('should get a 200 status code and respond with a profile if the request is valid', () => {
      let tempProfileMock = null;
      return profileMockFactory.create()
        .then(profile => {
          tempProfileMock = profile;
          return superagent.get(`${apiURL}/profiles/${profile.profile._id}`)
            .set('Authorization', `Bearer ${profile.accountMock.token}`);
        })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body.firstName).toEqual(tempProfileMock.profile.firstName);
          expect(response.body._id).toEqual(tempProfileMock.profile._id.toString());
        });
    });

    test('should get a 404 if the id is bad', () => {
      let tempProfileMock = null;
      return profileMockFactory.create()
        .then(profile => {
          tempProfileMock = profile;
          return superagent.get(`${apiURL}/profiles/superFakeID`)
            .set('Authorization', `Bearer ${profile.accountMock.token}`);
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404);
        });
    });

    test('should get a 401 due to bad token or no token', () => {
      let tempProfileMock = null;
      return profileMockFactory.create()
        .then(profile => {
          tempProfileMock = profile;
          return superagent.get(`${apiURL}/profiles/${profile.profile._id}`)
            .set('Authorization', `Bearer fakeToken}`);
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(401);
        });
    });



  }
  );
});