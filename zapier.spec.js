const test = require('tape');
const deepAssign = require('deep-assign');
const zap = require('./zapier.js');

const testBundle = {
  action_fields_full: {
    Email: 'test@apsis.com',
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
      Result: {
        Demographics: [
          'first_name',
          'last_name',
          'age',
        ],
      },
    }),
  },
  trigger_fields: {
    Keyword: 'keyword',
  },
};

test('apsis_get_demographic_data_post_poll', (t) => {
  const sut = zap.apsis_get_demographic_data_post_poll;
  t.equal(typeof sut, 'function');

  const result = sut(testBundle);
  t.notEqual(result, testBundle.response);
  t.looseEqual(result, {
    content: ['first_name', 'last_name', 'age'],
  });
  t.end();
});

test('apsis_get_subscriber_id_pre_write', (t) => {
  const sut = zap.apsis_get_subscriber_id_pre_write;
  t.equal(typeof sut, 'function');

  const expectedResponse = {
    id: 0,
    method: 'GET',
    data: '"test@apsis.com"',
  };
  const response = sut(testBundle);
  t.notEqual(response, testBundle.request);
  t.looseEqual(response, expectedResponse, 'Should have an updated response.data object');

  t.end();
});

test('apsis_unsubscribe_pre_write', (t) => {
  const sut = zap.apsis_unsubscribe_pre_write;
  t.equal(typeof sut, 'function');

  const expectedResponse = {
    id: 0,
    method: 'GET',
    data: JSON.stringify([{
      MailinglistId: 0,
      Reason: 'Moved to OptOutAll via Zapier',
      SendQueueId: 0,
      SubscriberId: 123,
    }]),
  };

  const response = sut(testBundle);
  t.notEqual(response, testBundle.request);
  t.looseEqual(response, expectedResponse, 'Should return a request object with appended data');
  t.end();
});

test('apsis_incoming_sms_post_poll', (t) => {
  const sut = zap.apsis_incoming_sms_post_poll;
  t.equal(typeof sut, 'function');

  const response = sut(testBundle);
  const expectedResponse = deepAssign({}, JSON.parse(testBundle.response.content), {
    SmsResponse: 'A for sms',
  });

  t.notEqual(response, testBundle.response);
  t.looseEqual(response, expectedResponse, 'Should remove keyword from response.content');
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
