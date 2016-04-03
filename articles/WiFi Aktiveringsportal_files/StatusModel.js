"use strict";
function StatusModel() {
    var self = this;

    self.wifi = ko.observable(false);
    self.produkt = ko.observable(false);
    self.tdcmail = ko.observable(false);
    self.foreningsmail = ko.observableArray();
    self.smpforeningsmail = ko.observableArray();
    self.staticIp = ko.observable(false);
    self.youseeLogin = ko.observable(false);
    self.emailunblock = ko.observable(false);
    self.yousee = ko.observable(false);

    self.cableModem = ko.observable(null);
    self.smpCableModem = ko.observable(null);

    self.cpes = ko.observableArray([]);
    self.smpCpes = ko.observableArray([]);

    this.buildServices = function(value) {
        switch (value.type) {
            case "WiFi":
                self.wifi(value);
                break;
            case "InternetAccess":
                self.produkt(value);
                break;
            case "StaticIp":
                self.staticIp(value);
                break;
            case "EmailUnblock":
                self.emailunblock(value);
                break;
            case "TdcMail":
                self.tdcmail([]);
                break;
            case "Foreningsmail":
                jQuery.each(self.foreningsmail(), function(index, f) {
                    if (f.position === value.position) {
                        value.foreningsmail = f;
                    }
                });
                self.smpforeningsmail.push(value);
                break;
        }
    };

    this.isSuspendState = function() {
        console.info(self.produkt());
        return self.produkt().hasOwnProperty('suspendBillingState') || self.produkt().hasOwnProperty('suspendAbuseState');
    };

    this.buildAccessnetServices = function(value) {
        switch (value.deviceType) {
            case "CableModem":
                self.cableModem(value);
                break;
            case "Computer":
                self.cpes.push(value);
                break;
        }
    };

    this.buildSmpAccessnetServices = function(value) {
        switch (value.type) {
            case "CableModem":
                self.smpCableModem(value);
                break;
            case "Computer":
                self.smpCpes.push(value);
                break;
        }
    };


    this.reload = function() {
        mainModel.nextSite("STATUS");
    };

    this.load = function() {

        var success = function(data, status, xhr) {
            console.info(data);
            mainModel.youseeSession = data;
            self.loadServices();
            if (self.isSuspendState()) {
                self.loadSuspendModal();
            }
        };

        var error = function(xhr, status, error) {
            try {
                var data = JSON.parse(xhr.responseText);

                if (data.next) {
                    mainModel.nextSite(data.next.site);
                    if (data.message === "NoActiveBB") {
                        mainModel.warnTxt("Der er ikke registreret Bredbånd. kontakt din internet udbyder.");
                    } else {
                        mainModel.errorTxt("Der er opstået en fejl, prøv igen senere.");
                    }
                    return;
                }
            } catch (e) {
            }

            mainModel.errorTxt("Der er opstået en fejl, prøv igen senere.");
        };

        //var statusLink = mainModel.youseeSession.next.uri;
        var statusLink = "activation/status/" + mainModel.youseeSession.session;
        $.callASyncJSON(statusLink, 'GET', null, success, error);

    };

    this.loadServices = function() {
        if (mainModel.youseeSession.smpservices) {
            self.smpforeningsmail.removeAll();
            jQuery.each(mainModel.youseeSession.smpservices, function(index, value) {
                self.buildServices(value);
            });
        }

        if (mainModel.youseeSession.smpaccessnet) {
            jQuery.each(mainModel.youseeSession.smpaccessnet, function(index, value) {
                self.buildSmpAccessnetServices(value);
            });
        }

        if (mainModel.youseeSession.accessnet) {
            jQuery.each(mainModel.youseeSession.accessnet, function(index, value) {
                self.buildAccessnetServices(value);
            });
        }

        if (mainModel.youseeSession.newcustomer) {
            var d = mainModel.youseeSession.newcustomer;
            if(d.mail || d.mobil || d.password){
                self.yousee(d);
            }
        }

        if (mainModel.youseeSession.ysprotdcmail) {
            self.tdcmail(mainModel.youseeSession.ysprotdcmail);
        }

        if (mainModel.youseeSession.yspro_userinfo) {
            var input = {
                username: mainModel.youseeSession.yspro_userinfo.UserLogin,
                email: mainModel.youseeSession.yspro_userinfo.EmailAddress,
                mobil: mainModel.youseeSession.yspro_userinfo.CellPhone
            };
            self.youseeLogin(input);
        }

        // check for dualCPE
        var cpes = jsonPath(mainModel.youseeSession.smpaccessnet, "$.[?(@['type'] == 'Computer')]");
        if (!mainModel.youseeSession.deletecpe && cpes && cpes.length > 1 && cpes[1].macAddress) {
            self.loadUdstyrModal(cpes);
        }
    };

    this.afslut = function() {
        if (self.yousee().inforce === true) {
            self.loadYsproModal();
        } else {
            mainModel.nextSite();
        }
    };

    this.loadSuspendModal = function() {
        $.loadHTML("modalDialog", "content/blocked.html", new BlockedModel(self));
    };

    this.loadWiFiModal = function() {
        $.loadHTML("modalDialog", "content/wifi.html", new WiFiModel(self));
    };

    this.loadUdstyrModal = function(cpes) {
        $.loadHTML("modalDialog", "content/udstyr.html", new UdstyrModel(self, cpes));
    };

    this.loadForeningsmailModal = function(element) {
        var pos = element.position;
        $.loadHTML("modalDialog", "content/foreningsmail.html", new ForeningsmailModel(self, pos));
    };

    this.loadYsproModal = function() {
        $.loadHTML("modalDialog", "content/newcustomer.html", new Newcustomer(self));
    };

    this.loadMailModal = function() {
        $.loadHTML("modalDialog", "content/mail.html", new MailModel(self.tdcmail));
    };

    this.gem = function() {

    };

    this.udskriv = function() {
        print($('#print'));
    };
}


