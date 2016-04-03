"use strict";
function WiFiModel(statusModel) {
    var self = this;

    self.statusModel = statusModel;
    self.wifiData = statusModel.wifi;
    self.channels = ko.observableArray([]);
    self.channel = ko.observable(0);
    self.ssid = ko.observable(self.wifiData().ssid);
    self.psk = ko.observable(self.wifiData().psk);
    self.fastWiFi = ko.observable(false);
    self.channels5Ghz = ko.observableArray([]);
    self.psk_5g = ko.observable(self.wifiData().psk_5g);
    self.gw_channel_id_5g = ko.observable(0);
    self.ss_id_5g = ko.observable(self.wifiData().ss_id_5g);

    this.init = function() {
        this.validSSID(self.ssid());
        this.validSSID5G(self.ss_id_5g());

        this.validPSK(self.psk());
        this.validPSK5G(self.psk_5g());

        var c, chan, chan5;
        if (statusModel.cableModem() && statusModel.cableModem().capabilities) {
            c = statusModel.cableModem().capabilities;
            if (c.WiFi === true) {
                chan = c.WiFiChannels;
                if (chan[0] === '0')
                    chan[0] = 'Auto';
                self.channels(chan);
            }
            if (c.WiFi5G === true) {
                self.fastWiFi(true);
                chan5 = c.WiFi5GChannels;
                if (chan5[0] === '0')
                    chan5[0] = 'Auto';
                self.channels5Ghz(chan5);
            }

        } else if (statusModel.smpCableModem() && statusModel.smpCableModem().capabilities) {
            c = statusModel.smpCableModem().capabilities;
            if (c.WiFi === true) {
                chan = c.WiFiChannels;
                if (chan[0] === '0')
                    chan[0] = 'Auto';
                self.channels(chan);
            }
            if (c.WiFi5G === true) {
                self.fastWiFi(true);
                chan5 = c.WiFi5GChannels;
                if (chan5[0] === '0')
                    chan5[0] = 'Auto';
                self.channels5Ghz(chan5);
            }
        }

        self.channel(self.wifiData().channel);
        self.gw_channel_id_5g(self.wifiData().gw_channel_id_5g);
    };

    this.saveWiFi = function() {
        $('#saveWifi').button('loading');
        $('.wifi-warning').hide();

        var url = 'activation/WiFi/' + mainModel.youseeSession.session;

        var input = {
            ssid: self.ssid(),
            ss_id_5g: self.ss_id_5g(),
            psk: self.psk(),
            psk_5g: self.psk_5g()
        };

        if (self.channel() === 'Auto') {
            input.channel = '0';
        } else {
            input.channel = self.channel();
        }

        if (self.fastWiFi()) {
            if (self.gw_channel_id_5g() === 'Auto') {
                input.gw_channel_id_5g = '0';
            } else {
                input.gw_channel_id_5g = self.gw_channel_id_5g();
            }

        }

        var error = function(xhr, status, error) {
            if (xhr.status === 406) {
                //handle backend error msg
                var doc = JSON.parse(xhr.responseText);
                var s = doc.statuscode;
                $('#' + s).show();
            } else {
                $('#errorDown').show();
            }
            $('#saveWifi').button('reset');
        };

        var data = $.callSyncJSON(url, 'PUT', input, error);
        if (data) {
            console.info(data);
            mainModel.youseeSession = data;
            self.statusModel.loadServices();
            $('#saveWifi').button('reset');
            $('#modalDialog').modal('hide');
        }
    };

    this.close = function() {
        $('#modalDialog').modal('hide');
    };

    var ssidReg = new RegExp("^[a-zA-Z0-9](?:[a-zA-Z0-9_-]*[a-zA-Z0-9])?$");
    var reg = new RegExp("^[A-Za-z0-9]+$");
    
    this.validSSID = function(newValue) {
        var ssidOk = true;
        //Rule no 1. - Max 20 chars
        if (newValue.length <= 20 && newValue.length >= 4) {
            $('#img11').attr('src', 'img/check.gif');
        } else {
            ssidOk = false;
            $('#img11').attr('src', 'img/cross.gif');
            $('#ssid').attr('title', 'SSID skal være på 4-20 tegn!');
        }

        if (ssidReg.test(newValue))
        {
            $('#img12').attr('src', 'img/check.gif');
        } else {
            ssidOk = false;
            $('#img12').attr('src', 'img/cross.gif');
            $('#ssid').attr('title', 'Kun A-Z, a-z og 0-9, æøå er ikke tilladt');
        }

        if (!ssidOk) {
            $('#ssidError').addClass('error');
        } else {
            $('#ssidError').removeClass('error');
            $('#ssid').attr('title', 'Ok');
        }
    };

    this.validSSID5G = function(newValue) {
        var ssidOk = true;
        //Rule no 1. - Max 20 chars
        if (newValue.length <= 20 && newValue.length >= 4) {
            $('#img11').attr('src', 'img/check.gif');
        } else {
            ssidOk = false;
            $('#img11').attr('src', 'img/cross.gif');
            $('#ss_id_5g').attr('title', 'SSID 5g skal være på 4-20 tegn!');
        }

        if (ssidReg.test(newValue))
        {
            $('#img12').attr('src', 'img/check.gif');
        } else {
            ssidOk = false;
            $('#img12').attr('src', 'img/cross.gif');
            $('#ss_id_5g').attr('title', 'Kun A-Z, a-z og 0-9, æøå er ikke tilladt');
        }

        if (!ssidOk) {
            $('#ssid5Error').addClass('error');
        } else {
            $('#ssid5Error').removeClass('error');
            $('#ss_id_5g').attr('title', 'Ok');
        }
    };

    this.validPSK = function(newValue) {
        var wpaOK = true;
        if (newValue.length <= 16 && newValue.length >= 8) {
            $('#img13').attr('src', 'img/check.gif');
        } else {
            wpaOK = false;
            $('#img13').attr('src', 'img/cross.gif');
            $('#psk').attr('title', 'Netværksnøglen skal være på 8-20 tegn!');
        }

        if (reg.test(newValue))
        {
            $('#img14').attr('src', 'img/check.gif');

        } else {
            wpaOK = false;
            $('#img14').attr({src: 'img/cross.gif', title: 'Kun A-Z, a-z og 0-9, æøå er ikke tilladt'});
            $('#psk').attr('title', 'Kun A-Z, a-z og 0-9, æøå er ikke tilladt');
        }

        if (!wpaOK) {
            $('#pskError').addClass('error');
        } else {
            $('#pskError').removeClass('error');
            $('#psk').attr('title', 'Ok');
        }
    };

    this.validPSK5G = function(newValue) {
        var wpaOK = true;
        if (newValue.length <= 16 && newValue.length >= 8) {
            $('#img13').attr('src', 'img/check.gif');
        } else {
            wpaOK = false;
            $('#img13').attr('src', 'img/cross.gif');
            $('#psk_5g').attr('title', 'Netværksnøglen 5g skal være på 8-20 tegn!');
        }

        if (reg.test(newValue))
        {
            $('#img14').attr('src', 'img/check.gif');

        } else {
            wpaOK = false;
            $('#img14').attr({src: 'img/cross.gif', title: 'Kun A-Z, a-z og 0-9, æøå er ikke tilladt'});
            $('#psk_5g').attr('title', 'Kun A-Z, a-z og 0-9, æøå er ikke tilladt');
        }

        if (!wpaOK) {
            $('#psk5Error').addClass('error');
        } else {
            $('#psk5Error').removeClass('error');
            $('#psk_5g').attr('title', 'Ok');
        }
    };

    self.ssid.subscribe(function(newValue) {
        self.validSSID(newValue);
    });

    self.ss_id_5g.subscribe(function(newValue) {
        self.validSSID5G(newValue);
    });

    self.psk.subscribe(function(newValue) {
        self.validPSK(newValue);
    });

    self.psk_5g.subscribe(function(newValue) {
        self.validPSK5G(newValue);
    });
}

