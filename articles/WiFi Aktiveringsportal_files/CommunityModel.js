"use strict";
function CommunityModel() {
    var self = this;
    this.errorTxt = ko.observable(null);
    self.done = ko.observable(false);
    self.hasChecked = ko.observable(false);

    this.next = function() {
        var uri = "activation/cwifidone/" + mainModel.youseeSession.session;
        console.info(navigator.userAgent);
        console.info($.ua.get());
        console.info($.ua.device);    
        console.info($.ua.os);
        var d;
        if($.ua.device.vendor && $.ua.device.model) {
            d = $.ua.device.vendor + ' ' + $.ua.device.model;
        } else if($.ua.os.name && $.ua.os.version){
            d = $.ua.os.name + ' ' + $.ua.os.version;
        } else {
            d = 'Ukendt';
        } 

        var body = {device: d};     

        var success = function(data, status, xhr) {
            console.info(data);
            //start count
            self.done(true); 
            self.countdown(mainModel.youseeSession.finallink.uri);
        };
        
        var error = function(xhr, status, error) {
            console.info(xhr);
            //ErrorPopup
            self.errorTxt("Der er opstået en fejl, prøv igen senere.");
        };
        $.callASyncJSON(uri, "POST", body, success, error);
    };

    this.countdown = function(url) {
        console.info(url);
        var time = $('#timer').text();
        setInterval(function() {
            if (time > 0) {
                $('#timer').text(time--);
            } else {
                location.href = url;
                time = -1;
            }
        }, 1000);
    };

}


