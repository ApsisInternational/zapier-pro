const test = require('tape');
const zap = require('./zapier.js');

const testBundle = {
  action_fields_full: {
    SubscriberId: 123,
  },
  name: 'test',
  request: {
    id: 0,
    method: 'GET',
  },
  response: {
    content: JSON.stringify({
      id: 0,
      SmsResponse: 'A keyword for sms',
    }),
  },
  trigger_fields: {
    Keyword: 'keyword',
  },
};

test('apsis_incoming_sms_post_poll', (t) => {
  const sut = zap.apsis_incoming_sms_post_poll;
  t.equal(typeof sut, 'function');

  const response = sut(testBundle);
  t.looseEqual(response, {
    id: 0,
    SmsResponse: 'A for sms',
  }, 'Should remove keyword from response.content');
  t.end();
});

test('apsis_get_mailinglist_pre_poll', (t) => {
  const sut = zap.apsis_get_mailinglist_pre_poll;
  t.equal(typeof sut, 'function', 'Should be a function');

  const response = sut(testBundle);

  t.notEqual(response, testBundle.request, 'Should not return the same object');
  t.equal(response.id, testBundle.request.id, 'Should not touch other props');
  t.equal(response.method, 'POST', 'Should update the method to POST');
  t.end();
});
