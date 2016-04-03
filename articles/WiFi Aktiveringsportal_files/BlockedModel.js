"use strict";
function BlockedModel(statusModel) {
    var self = this;

    self.regning = ko.observable(false);
    self.abuse = ko.observable(false);
    self.lukket = ko.observable(false);
    self.bero = ko.observable(false);
    self.subscriber = ko.observable();
    self.exitKnap = ko.observable(false);


    var data = statusModel.produkt();
    // let billing system suspends take precedence over abuse system suspends, to avoid 
    // communicating complex dual suspend state to the subscriber.
    if (data.hasOwnProperty('suspendBillingState')) {
        if (data.suspendBillingState === 'REGNING') {
            self.regning('REGNING');
        } else if (data.suspendBillingState === 'OPSAGT') {
            self.lukket('LUKKET');
        } else {
            self.bero('BERO');
        }
    } else if (data.hasOwnProperty('suspendAbuseState')) {
        if (data.suspendAbuseState === 'ABUSE') {
            self.abuse('ABUSE');
        } else if (data.suspendAbuseState === 'ABUSEWARNING') {
            self.abuse('ABUSEWARNING');
            self.exitKnap(true);
        } else if (data.suspendAbuseState === 'MODEM') {
            self.abuse('MODEM');
            self.exitKnap(true);
            var str = {
                sub: mainModel.youseeSession.subscriber.subscriber,
                pass: data.modemId
            };
            self.subscriber(str);
        }
    }

    $(document).keydown(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode === 13 || keycode === 27) {
            self.exit();
        }
    });

    self.keyEvent = function(data, event) {
        console.info(event);
    };

    self.exit = function() {
        // Do-nothing unless we're abusewarning.
        if (self.abuse() === 'ABUSEWARNING' || self.abuse() === 'MODEM') {
            $(document).unbind('keydown');
            $('#modalDialog').modal('hide');
            if (statusModel.yousee() === false) {
                mainModel.nextSite();
            } 
        }
    };

    self.afslut = function() {
        window.location = '/';
    };
}
