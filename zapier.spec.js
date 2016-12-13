const test = require('tape');
const deepAssign = require('deep-assign');
const zap = require('./zapier.js');

function getTestBundle() {
  return {
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
}

function getAndTestMethod(t, name) {
  const sut = zap[name];
  t.equal(typeof sut, 'function');

  return sut;
}


test('apsis_get_active_events_pre_poll', (t) => {
  const sut = getAndTestMethod(t, 'apsis_get_active_events_pre_poll');
  const result = sut(getTestBundle());
  const expectedResult = deepAssign({}, getTestBundle().request, {
    method: 'POST',
    data: JSON.stringify({
      ExcludeDisabled: 'true',
    }),
  });

  t.looseEqual(result, expectedResult, 'Should update method and content data.');
  t.end();
});

test('apsis_get_demographic_data_post_poll', (t) => {
  const sut = getAndTestMethod(t, 'apsis_get_demographic_data_post_poll');

  const result = sut(getTestBundle());
  t.notEqual(result, getTestBundle().response);
  t.looseEqual(result, {
    content: ['first_name', 'last_name', 'age'],
  });
  t.end();
});

test('apsis_get_subscriber_id_pre_write', (t) => {
  const sut = getAndTestMethod(t, 'apsis_get_subscriber_id_pre_write');
  const response = sut(getTestBundle());
  const expectedResponse = {
    id: 0,
    method: 'GET',
    data: '"test@apsis.com"',
  };

  t.notEqual(response, getTestBundle().request);
  t.looseEqual(response, expectedResponse, 'Should have an updated response.data object');

  t.end();
});

test('apsis_unsubscribe_pre_write', (t) => {
  const sut = getAndTestMethod(t, 'apsis_unsubscribe_pre_write');
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

  const response = sut(getTestBundle());
  t.notEqual(response, getTestBundle().request);
  t.looseEqual(response, expectedResponse, 'Should return a request object with appended data');
  t.end();
});

test('apsis_incoming_sms_post_poll', (t) => {
  const sut = getAndTestMethod(t, 'apsis_incoming_sms_post_poll');
  t.equal(typeof sut, 'function');

  const response = sut(getTestBundle());
  const expectedResponse = deepAssign({}, JSON.parse(getTestBundle().response.content), {
    SmsResponse: 'A for sms',
  });

  t.notEqual(response, getTestBundle().response);
  t.looseEqual(response, expectedResponse, 'Should remove keyword from response.content');
  t.end();
});

test('apsis_get_mailinglist_pre_poll', (t) => {
  const sut = getAndTestMethod(t, 'apsis_get_mailinglist_pre_poll');
  t.equal(typeof sut, 'function', 'Should be a function');

  const response = sut(getTestBundle());

  t.notEqual(response, getTestBundle().request, 'Should not return the same object');
  t.equal(response.id, getTestBundle().request.id, 'Should not touch other props');
  t.equal(response.method, 'POST', 'Should update the method to POST');
  t.end();
});
