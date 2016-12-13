const test = require('tape');
const deepAssign = require('deep-assign');
const zap = require('./zapier.js');

function getTestBundle() {
  return {
    action_fields_full: {
      Email: 'test@apsis.com',
      email: 'test@apsis.com',
      SubscriberId: 123,
      Status: '1',
    },
    name: 'test',
    request: {
      id: 0,
      method: 'GET',
    },
    response: {
      content: JSON.stringify({
        id: 0,
        Message: 'This is a message',
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
    search_fields: {
      eventId: 123,
    },
    trigger_fields: {
      Keyword: 'keyword',
      EventId: 123,
      Status: 1,
    },
  };
}

function getAndTestMethod(t, name) {
  const sut = zap[name];
  t.equal(typeof sut, 'function', 'Should be an exported method');

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

  t.looseEqual(result, {
    content: ['first_name', 'last_name', 'age'],
  });
  t.end();
});

test('apsis_get_subscriber_id_pre_write', (t) => {
  const sut = getAndTestMethod(t, 'apsis_get_subscriber_id_pre_write');
  const result = sut(getTestBundle());
  const expectedResult = {
    id: 0,
    method: 'GET',
    data: '"test@apsis.com"',
  };

  t.looseEqual(result, expectedResult, 'Should have an updated result.data object');
  t.end();
});

test('apsis_unsubscribe_pre_write', (t) => {
  const sut = getAndTestMethod(t, 'apsis_unsubscribe_pre_write');
  t.equal(typeof sut, 'function');

  const expectedResult = {
    id: 0,
    method: 'GET',
    data: JSON.stringify([{
      MailinglistId: 0,
      Reason: 'Moved to OptOutAll via Zapier',
      SendQueueId: 0,
      SubscriberId: 123,
    }]),
  };

  const result = sut(getTestBundle());

  t.looseEqual(result, expectedResult, 'Should return a request object with appended data');
  t.end();
});

test('apsis_incoming_sms_post_poll', (t) => {
  const sut = getAndTestMethod(t, 'apsis_incoming_sms_post_poll');
  t.equal(typeof sut, 'function');

  const result = sut(getTestBundle());
  const expectedResult = deepAssign({}, JSON.parse(getTestBundle().response.content), {
    SmsResponse: 'A for sms',
  });

  t.looseEqual(result, expectedResult, 'Should remove keyword from response.content');
  t.end();
});

test('apsis_get_mailinglist_pre_poll', (t) => {
  const sut = getAndTestMethod(t, 'apsis_get_mailinglist_pre_poll');
  t.equal(typeof sut, 'function', 'Should be a function');

  const result = sut(getTestBundle());

  t.equal(result.id, getTestBundle().request.id, 'Should not touch other props');
  t.equal(result.method, 'POST', 'Should update the method to POST');
  t.end();
});

test('apsis_get_event_attendee_pre_poll', (t) => {
  const sut = getAndTestMethod(t, 'apsis_get_event_attendee_pre_poll');
  const result = sut(getTestBundle());
  const expectedResult = Object.assign({}, getTestBundle().request, {
    method: 'POST',
    data: JSON.stringify({
      EventId: getTestBundle().trigger_fields.EventId,
      AttendeeStatus: getTestBundle().trigger_fields.Status,
    }),
  });

  t.looseEqual(result, expectedResult, 'Should update bundle method and data');
  t.end();
});

test('apsis_find_attendee_pre_search', (t) => {
  const sut = getAndTestMethod(t, 'apsis_find_attendee_pre_search');
  const result = sut(getTestBundle());
  const expectedResult = Object.assign({}, getTestBundle().request, {
    method: 'POST',
    data: JSON.stringify({
      EventId: getTestBundle().search_fields.eventId,
    }),
  });

  t.looseEqual(result, expectedResult, 'Should update bundle request method and data');
  t.end();
});

test('apsis_update_event_attendee_pre_write', (t) => {
  const sut = getAndTestMethod(t, 'apsis_update_event_attendee_pre_write');
  const result = sut(getTestBundle());
  const expectedResult = Object.assign({}, getTestBundle().request, {
    method: 'PUT',
    data: JSON.stringify(getTestBundle().action_fields_full.Status),
  });

  t.looseEqual(result, expectedResult, 'Should update bundle request method and data');
  t.end();
});

test('apsis_new_mailinglist_subscriber_pre_poll', (t) => {
  const sut = getAndTestMethod(t, 'apsis_new_mailinglist_subscriber_pre_poll');
  const result = sut(getTestBundle());
  const expectedResult = Object.assign({}, getTestBundle().request);

  t.looseEqual(result, expectedResult, 'Should return the bundle request');
  t.end();
});

test('remove_subscriber_from_optoutall_pre_write', (t) => {
  const sut = getAndTestMethod(t, 'remove_subscriber_from_optoutall_pre_write');
  const result = sut(getTestBundle());
  const expectedResult = Object.assign({}, getTestBundle().request, {
    method: 'DELETE',
    data: JSON.stringify(getTestBundle().action_fields_full.email),
  });

  t.looseEqual(result, expectedResult, 'Should update bundle request method and data');
  t.end();
});

test('remove_subscriber_from_optoutall_post_write', (coll) => {
  const sut = getAndTestMethod(coll, 'remove_subscriber_from_optoutall_post_write');

  test('with a correct message it should set status_code to 200', (t) => {
    const testBundle = deepAssign(getTestBundle(), {
      response: {
        content: JSON.stringify({
          Message: 'Subscriber e-mail address does not exist on the Opt-out all list',
        }),
      },
    });
    const result = sut(testBundle);
    const expectedResult = Object.assign({}, testBundle.response, {
      status_code: 200,
    });

    t.looseEqual(result, expectedResult, 'Should update bundle request method and data');
    t.end();
  });

  test('with another message it should not set status_code', (t) => {
    const result = sut(getTestBundle());
    const expectedResult = Object.assign({}, getTestBundle().response);

    t.looseEqual(result, expectedResult, 'Should update bundle request method and data');
    t.end();
  });

  coll.end();
});

test('apsis_send_transactional_email_copy_pre_write', (coll) => {
  const sut = getAndTestMethod(coll, 'apsis_send_transactional_email_copy_pre_write');

  test('if no key called Value or Key return bundle.request with an empty data string', (t) => {
    const result = sut(getTestBundle());
    const expectedResult = Object.assign({}, getTestBundle().request, { data: '{}' });
    t.looseEqual(result, expectedResult, 'Should update bundle request method and data');
    t.end();
  });

  test('if action_fields contains keys, they should be appended to the stringified data object', (t) => {
    const actionFields = {
      name: 'test',
      age: 99,
    };
    const testBundle = Object.assign({}, getTestBundle(), {
      action_fields: actionFields,
    });
    const result = sut(testBundle);
    const expectedResult = Object.assign({}, getTestBundle().request, {
      data: JSON.stringify(actionFields),
    });

    t.looseEqual(result, expectedResult, 'should contain name and age keys');
    t.end();
  });

  test('if action_fields contains a key called "Key", ', (t) => {
    t.end();
  });

  coll.end();
});

test('apsis_get_active_events_post_poll', (coll) => {
  const sut = getAndTestMethod(coll, 'apsis_get_active_events_post_poll');

  test('if response.content.result has more than one entry, it should throw', (t) => {
    const testBundle = Object.assign({}, getTestBundle(), {
      response: {
        content: JSON.stringify({
          Result: [1, 2],
        }),
      },
    });

    try {
      sut(testBundle);
    } catch (err) {
      t.ok(err);
    }

    t.end();
  });

  test('if response.content.result has < 1 entry, that should be returned', (t) => {
    const resultObj = [{ Id: 0, Name: 'Test' }];
    const testBundle = Object.assign({}, getTestBundle(), {
      response: {
        content: JSON.stringify({
          Result: resultObj,
        }),
      },
    });

    const result = sut(testBundle);
    const expectedResult = Object.assign({}, testBundle.response, {
      content: resultObj,
    });

    t.looseEqual(result, expectedResult, 'response.content should have have the props from Result');
    t.end();
  });

  coll.end();
});
