var Zap = {
    apsis_send_transactional_email_copy_pre_write: function(bundle) {
        // Working
        var ActionFields = bundle.action_fields;
        var Data = {};
        var DemDataFields = [];
        for(var prop in ActionFields){
            if(ActionFields.hasOwnProperty(prop)){
                if(prop === "Key"){
                    var Keys = ActionFields[prop];
                    var index = 0;                    
                    for (var pr in Keys) {
                        if(DemDataFields.length-1 < index){
                            throw new ErrorException('The number of Demographic Data fields can not be greater than the number of Values.');                           
                        }
                        DemDataFields[pr].Key = Keys[pr];
                        index++;
                    }
                }
                else if(prop === "Value"){
                    var Values = ActionFields[prop];
                    for (var p in Values) {
                        var NewObj = {Value: Values[p], Key: ""};
                        DemDataFields.push(NewObj);
                    }
                }
                else{
                    Data[prop] = ActionFields[prop];
                }
            }
        }
        if(DemDataFields.length > 0){
            for(var i = 0; i < DemDataFields.length; i++){
                if(DemDataFields[i].Key === ""){
                    throw new ErrorException('The number of Values can not be greater than the number of Demographic Data fields.');
                }
            }
            Data.DemDataFields = DemDataFields;
        }
        bundle.request.data = JSON.stringify(Data);
        return bundle.request; 
    },

    remove_subscriber_from_optoutall_post_write: function(bundle) {
        // Working
        var Response = JSON.parse(bundle.response.content);
        if(Response.Message === 'Subscriber e-mail address does not exist on the Opt-out all list')
        {
            bundle.response.status_code = 200;
        }
        console.log(Response.Message);
        return bundle.response;
    },

    remove_subscriber_from_optoutall_pre_write: function(bundle) {
        // Working
        bundle.request.method = 'DELETE';
        var Data = bundle.action_fields_full.email;
        bundle.request.data = JSON.stringify(Data);
        return bundle.request;
    },


    apsis_new_mailinglist_subscriber_post_poll: function(bundle) {
        // Working
        var Data = JSON.parse(bundle.response.content);
        if(Data.Code != 1) {
            throw new ErrorException('Unable to retrieve the subscribers on the mailinglist');
        }
        else {
            var Pages = parseInt(Data.Result.TotalPages, 10);
            console.log(typeof(Pages));
            if(Pages > 1){
                var Request = {
                'method' : 'GET',
                'url' : 'https://se.api.anpdm.com:8443/v1/mailinglists/'+bundle.trigger_fields.MailinlistID+'/subscribers/'+Pages+'/100',
                'params' : {},
                'headers' : {
                    'accept' :'application/json',
                    'content-type' : 'application/json; charset=utf-8'
                },
                'auth' : bundle.request.auth,
                'data' : null
                };
                
                var Response = JSON.parse(z.request(Request));
                Data = Response.content;
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
        var Data = bundle.action_fields_full.Status ;
        bundle.request.data = JSON.stringify(Data);
        return bundle.request;
    },

    apsis_find_attendee_pre_search: function(bundle) {
        // Working
        var Data = { EventId : bundle.search_fields.eventId };
        bundle.request.method = 'POST';
        bundle.request.data = JSON.stringify(Data);
        return bundle.request;
    },

    apsis_get_event_attendee_pre_poll: function(bundle) {
        // Working
        var Data = {
            EventId : bundle.trigger_fields.EventId,
            AttendeeStatus : bundle.trigger_fields.Status
        };
        bundle.request.method = 'POST';
        bundle.request.data = JSON.stringify(Data);
        return bundle.request;  
    },

    apsis_get_active_events_post_poll: function(bundle) {
        // Working
        var Response = JSON.parse(bundle.response.content);
        var Result = Response.Result;
        if(Result.length > 1){
            throw new ErrorException('There are no active Events available on your APSIS account.');
        }
        var Events = [];
        for(var e in Result){
            var NewEvent = {Id : Result[e].Id, Name: Result[e].Name};
            Events.push(NewEvent);
        }
        bundle.response.content = Events;
        return bundle.response;
    },

    apsis_get_active_events_pre_poll: function(bundle) {
        // Working
        var Data = {ExcludeDisabled: "true"};
        bundle.request.method = 'POST';
        bundle.request.data = JSON.stringify(Data);
        return bundle.request;
    },

    apsis_create_subscriber_pre_write: function(bundle) {
        // Working
        var ActionFields = bundle.action_fields;
        var Data = {};
        var DemDataFields = [];
        for(var prop in ActionFields){
            if(ActionFields.hasOwnProperty(prop)){
                if(prop === "Key"){
                    var Keys = ActionFields[prop];
                    var index = 0;                    
                    for (var pr in Keys) {
                        if(DemDataFields.length-1 < index){
                            throw new ErrorException('The number of Demographic Data fields can not be greater than the number of Values.');                           
                        }
                        DemDataFields[pr].Key = Keys[pr];
                        index++;
                    }
                }
                else if(prop === "Value"){
                    var Values = ActionFields[prop];
                    for (var p in Values) {
                        var NewObj = {Value: Values[p], Key: ""};
                        DemDataFields.push(NewObj);
                    }
                }
                else{
                    Data[prop] = ActionFields[prop];
                }
            }
        }
        if(DemDataFields.length > 0){
            for(var i = 0; i < DemDataFields.length; i++){
                if(DemDataFields[i].Key === ""){
                    throw new ErrorException('The number of Values can not be greater than the number of Demographic Data fields.');
                }
            }
            Data.DemDataFields = DemDataFields;
        }
        bundle.request.data = JSON.stringify(Data);
        return bundle.request;
    },

    apsis_get_demographic_data_post_poll: function(bundle) {
        // Working
        var ResponseObj = JSON.parse(bundle.response.content);
        var ResultObj = ResponseObj.Result.Demographics;
        var NewObj = [];
        ResultObj.forEach(function(result, index){
            if(result.Key !== ""){
                NewObj.push(result);}
        });
        bundle.response.content = NewObj;
        return bundle.response;
    },

    apsis_get_subscriber_id_pre_write: function(bundle) {
        // Working
        var EmailData = bundle.action_fields_full.Email;
        bundle.request.data = "\""+EmailData+"\"";
        console.log(bundle.request.data);
        return bundle.request;
    },

    apsis_unsubscribe_pre_write: function(bundle) {
        // Working
        var JsonObj = {};
        JsonObj.MailinglistId = 0;
        JsonObj.Reason = "Moved to OptOutAll via Zapier";
        JsonObj.SendQueueId = 0;
        JsonObj.SubscriberId = bundle.action_fields_full.SubscriberId;
        var JsonArray = [];
        JsonArray.push(JsonObj);
        var JsonData = JSON.stringify(JsonArray);
        bundle.request.data = JsonData;
        return bundle.request;
    },

    apsis_incoming_sms_post_poll: function(bundle) {
        // Working
        var smskeyword = bundle.trigger_fields.Keyword;
        var results = JSON.parse(bundle.response.content, function(k,v){
          if(k === 'SmsResponse'){
            return v.replace(smskeyword + " ",'');
            }
            return v;
        });
        return results;
    },

        apsis_get_mailinglist_pre_poll: function(bundle) {
        bundle.request.method = 'POST';
        return bundle.request;
    }

};
