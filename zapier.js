const deepAssign = require('deep-assign');

const Zap = {
    apsis_send_transactional_email_copy_pre_write: function(bundle) {
        var actionFields = bundle.action_fields;
        var data = {};
        var demDataFields = [];
        for (var prop in actionFields) {
            if (actionFields.hasOwnProperty(prop)) {
                if (prop === "Key") {
                    var keys = actionFields[prop];
                    var index = 0;
                    for (var pr in keys) {
                        if (demDataFields.length - 1 < index) {
                            throw new ErrorException('The number of Demographic Data fields can not be greater than the number of values.');
                        }
                        demDataFields[pr].Key = keys[pr];
                        index++;
                    }
                }
                else if (prop === "Value") {
                    var values = actionFields[prop];
                    for (var p in values) {
                        var newObj = { Value: values[p], Key: "" };
                        demDataFields.push(newObj);
                    }
                }
                else {
                    data[prop] = actionFields[prop];
                }
            }
        }
        if (demDataFields.length > 0) {
            for (var i = 0; i < demDataFields.length; i++) {
                if (demDataFields[i].Key === "") {
                    throw new ErrorException('The number of values can not be greater than the number of Demographic Data fields.');
                }
            }
            data.demDataFields = demDataFields;
        }
        bundle.request.data = JSON.stringify(data);
        return bundle.request;
    },

    remove_subscriber_from_optoutall_post_write: function(bundle) {
        // Working
        var response = JSON.parse(bundle.response.content);
        if (response.Message === 'Subscriber e-mail address does not exist on the Opt-out all list') {
            bundle.response.status_code = 200;
        }
        console.log(response.Message);
        return bundle.response;
    },

    remove_subscriber_from_optoutall_pre_write: function(bundle) {
        // Working
        bundle.request.method = 'DELETE';
        var data = bundle.action_fields_full.email;
        bundle.request.data = JSON.stringify(data);
        return bundle.request;
    },


    apsis_new_mailinglist_subscriber_post_poll: function(bundle) {
        // Working
        var data = JSON.parse(bundle.response.content);
        if (data.Code != 1) {
            throw new ErrorException('Unable to retrieve the subscribers on the mailinglist');
        }
        else {
            var pages = parseInt(data.Result.TotalPages, 10);
            console.log(typeof (pages));
            if (pages > 1) {
                var request = {
                    'method': 'GET',
                    'url': 'https://se.api.anpdm.com:8443/v1/mailinglists/' + bundle.trigger_fields.MailinlistID + '/subscribers/' + pages + '/100',
                    'params': {},
                    'headers': {
                        'accept': 'application/json',
                        'content-type': 'application/json; charset=utf-8'
                    },
                    'auth': bundle.request.auth,
                    'data': null
                };

                var response = JSON.parse(z.request(request));
                data = response.content;
            }
            bundle.response.content = Subscribers;

            return bundle.response;
        }
    },

    apsis_new_mailinglist_subscriber_pre_poll: function(bundle) {
        // Working
        return bundle.request;
    },

    apsis_update_event_attendee_pre_write: function(bundle) {
        // Working
        bundle.request.method = 'PUT';
        var data = bundle.action_fields_full.Status;
        bundle.request.data = JSON.stringify(data);
        return bundle.request;
    },

    apsis_find_attendee_pre_search: function(bundle) {
        // Working
        var data = { EventId: bundle.search_fields.eventId };
        bundle.request.method = 'POST';
        bundle.request.data = JSON.stringify(data);
        return bundle.request;
    },

    apsis_get_event_attendee_pre_poll: function(bundle) {
        // Working
        var data = {
            EventId: bundle.trigger_fields.EventId,
            AttendeeStatus: bundle.trigger_fields.Status
        };
        bundle.request.method = 'POST';
        bundle.request.data = JSON.stringify(data);
        return bundle.request;
    },

    apsis_get_active_events_post_poll: function(bundle) {
        // Working
        var response = JSON.parse(bundle.response.content);
        var result = response.Result;
        if (result.length > 1) {
            throw new ErrorException('There are no active events available on your APSIS account.');
        }
        var events = [];
        for (var e in result) {
            var newEvent = { Id: result[e].Id, Name: result[e].Name };
            events.push(newEvent);
        }
        bundle.response.content = events;
        return bundle.response;
    },

    apsis_get_active_events_pre_poll: function(bundle) {
        // Working
        var data = { ExcludeDisabled: "true" };
        bundle.request.method = 'POST';
        bundle.request.data = JSON.stringify(data);
        return bundle.request;
    },

    apsis_create_subscriber_pre_write: function(bundle) {
        // Working
        var actionFields = bundle.action_fields;
        var data = {};
        var demDataFields = [];
        for (var prop in actionFields) {
            if (actionFields.hasOwnProperty(prop)) {
                if (prop === "Key") {
                    var keys = actionFields[prop];
                    var index = 0;
                    for (var pr in keys) {
                        if (demDataFields.length - 1 < index) {
                            throw new ErrorException('The number of Demographic Data fields can not be greater than the number of values.');
                        }
                        demDataFields[pr].Key = keys[pr];
                        index++;
                    }
                }
                else if (prop === "Value") {
                    var values = actionFields[prop];
                    for (var p in values) {
                        var newObj = { Value: values[p], Key: "" };
                        demDataFields.push(newObj);
                    }
                }
                else {
                    data[prop] = actionFields[prop];
                }
            }
        }
        if (demDataFields.length > 0) {
            for (var i = 0; i < demDataFields.length; i++) {
                if (demDataFields[i].Key === "") {
                    throw new ErrorException('The number of values can not be greater than the number of Demographic Data fields.');
                }
            }
            data.demDataFields = demDataFields;
        }
        bundle.request.data = JSON.stringify(data);
        return bundle.request;
    },

    apsis_get_demographic_data_post_poll: function(bundle) {
        // Working
        var responseObj = JSON.parse(bundle.response.content);
        var resultObj = responseObj.Result.Demographics;
        var newObj = [];
        resultObj.forEach(function(result, index) {
            if (result.Key !== "") {
                newObj.push(result);
            }
        });
        bundle.response.content = newObj;
        return bundle.response;
    },

    apsis_get_subscriber_id_pre_write: function(bundle) {
        var emailData = bundle.action_fields_full.Email;
        bundle.request.data = "\"" + emailData + "\"";

        // return deepAssign({}, bundle.request, {
        //   data: `"${bundle.action_fields_full.Email}"`, 
        // });
        return bundle.request;
    },

    apsis_unsubscribe_pre_write: function(bundle) {
        // Working
        var jsonObj = {};
        jsonObj.MailinglistId = 0;
        jsonObj.Reason = "Moved to OptOutAll via Zapier";
        jsonObj.SendQueueId = 0;
        jsonObj.SubscriberId = bundle.action_fields_full.SubscriberId;
        var jsonArray = [];
        jsonArray.push(jsonObj);
        var jsonData = JSON.stringify(jsonArray);
        bundle.request.data = jsonData;
        return bundle.request;
    },

    apsis_incoming_sms_post_poll(bundle) {
        const smskeyword = bundle.trigger_fields.Keyword;
        const results = JSON.parse(bundle.response.content, (key, value) => {
            if (key === 'SmsResponse') {
                // What if keyword is the last char, or is followed by a dot etc?
                return value.replace(smskeyword + " ", '');
            }
            return value;
        });

        return results;
    },

    apsis_get_mailinglist_pre_poll(bundle) {
        return deepAssign({}, bundle.request, {
            method: 'POST',
        });
    }
};

module.exports = Zap;
