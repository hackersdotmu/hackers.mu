"use strict";
function SignalModel(isMarkedFem) {
    var self = this;

    self.signalFejl = ko.observable('true');
    self.bestil = ko.observable(false);
    self.markedFem = ko.observable(isMarkedFem);
    self.siteconfig = ko.observable(mainModel.youseeSession.siteconfig);

    self.next = function() {
        self.signalFejl(false);

        var subscriber = mainModel.youseeSession.subscriber;

        self.bestil({navn: subscriber.firstName + ' ' + subscriber.lastName,
            vej: subscriber.address1,
            by: subscriber.postnummer + ' ' + subscriber.city,
            tlf: ''
        });
    };

    self.exit = function() {
        window.location = '/';
    };

    self.bestilTeknik = function() {
        var url = "activation/signal/" + mainModel.youseeSession.session;

        var input = {
            telefon: $('#tlf').val()
        };

        $.ajax({
            type: 'PUT',
            url: url,
            dataType: 'json',
            data: JSON.stringify(input),
            contentType: 'application/json',
            success: function(data, status, xhr) {
                console.info(data);
                mainModel.youseeSession = data;
                mainModel.nextSite();
            },
            error: function(xhr, status, error) {
                console.info(xhr);
                //ErrorPopup   
                $('#errorDownSignal').show();
            },
            async: true
        });
    };


}


