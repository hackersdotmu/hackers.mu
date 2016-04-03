"use strict";
function AfslutModel(statusModel) {
    var self = this;

    var auto = false;
    self.wifi = ko.observable(statusModel.wifi());
    self.user = ko.observable(false);
    self.pass = ko.observable(false);
    self.cableModem = statusModel.cableModem;
    self.smpCableModem = statusModel.smpCableModem;
    var final = 'http://yousee.dk/tvogfilm/overblik.aspx';
    
    self.doneDone = ko.observable(false);

    this.done = function() {


        if (mainModel.youseeSession.finallink) {
            final = mainModel.youseeSession.finallink;
            $('input[name=SucessURl]').val(final);
        }

        if (mainModel.youseeSession.newcustomer && mainModel.youseeSession.newcustomer.password) {
            var uri = "activation/kvittering/" + mainModel.youseeSession.session;
            var input = new Object();

            if (statusModel.youseeLogin() !== false) {
                var tmp = statusModel.youseeLogin();
                input.sso = {
                    username: tmp.username
                };
                if (tmp.password) {
                    self.user(tmp.username);
                    self.pass(tmp.password);
                    auto = true;
                }
            }

            if (statusModel.foreningsmail() !== false) {
                var tmp = statusModel.foreningsmail();
                if (typeof tmp.email !== 'undefined' && typeof tmp.password !== 'undefined') {
                    input.foreningsmail = {
                        email: tmp.email,
                        password: tmp.password
                    };
                }
            }

            if (statusModel.tdcmail() !== false) {
                var tmp = statusModel.tdcmail();
                if (typeof tmp.Alias !== 'undefined' && typeof tmp.password !== 'undefined') {
                    input.webmail = {
                        mail: tmp.Alias,
                        password: tmp.password
                    };
                }
            }

            $.callSyncJSON(uri, 'POST', input, null);
        }

        self.countdown();

        var uri = "activation/done/" + mainModel.youseeSession.session;

        var success = function(data, status, xhr) {
            console.info(data);
            //to countdown or not :)
            if (!data.smporderresult.countdown) {
                self.doneDone(true);
            }
        };

        var error = function(data, status, xhr) {
            console.info(xhr);
            //ErrorPopup
            $('#finish').hide();
            var msg;
            if (xhr.status === 406) {
                msg = "Der er opstået en fejl. For yderligere info og hjælp kontakt vores support."
            } else {
                msg = "Der er opstået en fejl, prøv igen senere.";
            }
            mainModel.errorTxt(msg);
        };

        $.callASyncJSON(uri, 'POST', null, success, error);
    };

    this.countdown = function() {
        console.info(final);
        $('#loading').modal('hide');
        var time = $('#timer').text();
        var interval = setInterval(function() {
            if (time > 0) {
                $('#timer').text(time--);
            } else {
                //Welcome to Internet we will rock u!!!1
                self.doneDone(true);
                clearInterval(interval);
            }
        }, 1000);
    };

    this.afslut = function() {
        if (auto) {
            $('#autoLogin').submit();
        } else {
            window.location = final;
        }
    };
}


