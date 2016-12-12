const test = require('tape');
const zap = require('./zapier.js');

const testBundle = {
  name: 'test',
  request: {
    id: 0,
    method: 'GET',
  },
};

test('apsis_get_mailinglist_pre_poll', (t) => {
  const sut = zap.apsis_get_mailinglist_pre_poll;
  t.equal(typeof sut, 'function', 'Should be a function');

  const response = sut(testBundle);

  t.notEqual(response, testBundle.request, 'Should not return the same object');
  t.equal(response.id, testBundle.request.id, 'Should not touch other props');
  t.equal(response.method, 'POST', 'Should update the method to POST');
  t.end();
});
