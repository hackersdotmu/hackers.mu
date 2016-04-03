"use strict";
function MainModel() {
    var self = this;
    this.youseeSession = null;
    this.statusModel = null;
    this.errorTxt = ko.observable(null);
    this.warnTxt = ko.observable(null);
    this.device = null;

    this.nextSite = function(site) {

        if (!site)
            site = self.youseeSession.next.site;

        switch (site) {
            case "LOGIN":
                self.showView(site.toLowerCase(), self, function(){
                    // Focus username on load
                    $('#username').focus();
                });
                break;
            case "STATUS":
                self.statusModel = new StatusModel();
                self.showView(site.toLowerCase(), self.statusModel, self.statusModel.load);
                break;
            case "SIGNAL":
                var signalModel = new SignalModel(self.youseeSession.siteconfig.isp.indexOf('YouSee') == -1);
                self.showView(site.toLowerCase(), signalModel);
                break;
            case "UDSTYR":
                var model = new UdstyrModel();
                self.showView(site.toLowerCase(), model, model.load);
                break;
            case "DONE":
                var model = new AfslutModel(self.statusModel);
                self.showView(site.toLowerCase(), model, model.done);
                break;
            case "BLOCKED":
                var model = new BlockedModel();
                self.showView(site.toLowerCase(), model);
                model.load();
                break;
            case "CWIFIDONE":
                var model = new CommunityModel();
                self.showView('community', model);
                break;
        }
    };

    this.showView = function(tab, model, callback) {
        $('#content').load("content/" + tab + ".html?" + new Date().getTime(), function() {        
            var content = $('#content')[0];
            if(content)
                ko.cleanNode(content);
            ko.applyBindings(model, content);
            if (callback)
                callback();
        });
    };

    this.init = function() {
        self.autoLogin();
    };

    this.autoLogin = function() {

        var success = function(data, status, xhr) {
            //console.info(data);
            self.youseeSession = data;
            if (data.siteconfig) {
                self.addStyleSheetIeFix(data.siteconfig);
            }

            if (data.communitywifi && data.communitywifi === true) { //community wifi 
                self.showView('communitylogin', self);
            } else {
                self.nextSite();
            }
        };

        var error = function(xhr, status, error) {
            // console.info(status);
            // self.errorTxt("Der er opstået en fejl, prøv igen senere.");
            // 
            self.showView('servicedown',self);
            self.youseeSession = null;
        };

        $.callASyncJSON("activation/login", "POST", null, success, error);
    };

    this.login = function() {

        self.warnTxt("");
        self.errorTxt("");

        var username = $('#username').val();
        var password = $('#password').val();


        if (!username || !password) {
            self.warnTxt("Brugernavn og adgangskode skal indtastes");
            return;
        }

        if (mainModel.youseeSession) {
            var input = {
                username: username,
                password: password
            };

            var success = function(data, status, xhr) {
                //console.info(data);
                self.youseeSession = data;
                if (data.siteconfig) {
                    self.addStyleSheetIeFix(data.siteconfig);
                }
                if (self.youseeSession.next.site === "LOGIN") {
                    self.warnTxt("Der er opstået en fejl, kontroller brugernavn og adgangskode og prøv igen, eller klik på ”Glemt dine Login oplysninger”.");
                } else {
                    self.nextSite();
                }
            };

            var error = function(xhr, status, error) {
                //console.info(status);
                if (xhr.status === 401) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        if (data.statuscode === "CWIFI-1") {
                            self.warnTxt("Der er opstået en fejl, kontroller brugernavn og adgangskode og prøv igen, eller klik på ”Glemt dine Login oplysninger”.");
                        } else if (data.statuscode === "CWIFI-2") {
                            self.warnTxt("Du har ikke rettigheder til dette produkt.");
                        } else {
                            self.warnTxt("Der er opstået en fejl, kontroller brugernavn og adgangskode og prøv igen, eller klik på ”Glemt dine Login oplysninger”.");
                        }
                    } catch (e) {
                        //console.info(e);
                        self.warnTxt("Der er opstået en fejl, kontroller brugernavn og adgangskode og prøv igen, eller klik på ”Glemt dine Login oplysninger”.");
                    }
                } else if (xhr.status === 400) {
                    self.errorTxt("Det angivne Brugernavn/Kundenummer kan ikke bruges til at aktivere bredbånd.");
                } else if (xhr.status === 409) {
                    self.errorTxt("Fejl i forbindelse med operttelse af login");
                } else {
                    self.errorTxt("Der er opstået en fejl, prøv igen senere.");
                }
            };

            $.callASyncJSON("activation/login/" + mainModel.youseeSession.session, "POST", input, success, error);

        } else {
            self.autoLogin();
        }
    };

    this.showForgotPassword = function() {
        self.warnTxt("");
        self.errorTxt("");
        $('#forgotModalContent').load("content/forgotPassword.html", function() {
            var cwifi = false;
            if (self.youseeSession.communitywifi && self.youseeSession.communitywifi === true) {
                cwifi = true;
            }
            ko.applyBindings(new ForgotPasswordModel(cwifi), document.getElementById("forgotModal"));
            $("#forgotModal").modal('show');
        });

    };

    //Oh yeah IE8 are so cool, FUCK U IE8 I HATE U - jq append not working :(
    this.addStyleSheetIeFix = function(siteconfig) {

        if(siteconfig.stylesheet==='css/blank.css') {
            return;
        }
        
        var ref = siteconfig.stylesheet;
        if (Browser.isIE) {
            ref = siteconfig.stylesheetIE;
        }        
        
        if (document.createStyleSheet) {
            document.createStyleSheet(ref);
        } else { 
            $('<link rel="stylesheet" type="text/css" href="' + ref + '" />').appendTo('head'); 
        }
    };
}

function ForgotPasswordModel(isCwifi) {
    var self = this;

    this.page = ko.observable(1);
    this.type = "SMS";
    this.availableTypesMap = {
        SMS: {id: "SMS", label: "Sms"},
        EMAIL: {id: "EMAIL", label: "E-mail"}
    };

    this.types = ko.observableArray([]);
    this.searchTxt = null;

    this.errorTxt = ko.observable(null);
    this.warnTxt = ko.observable(null);
    this.cwifi = ko.observable(false);
    this.forgetTimer = ko.observable(null);

    this.nextPage = function() {
        self.errorTxt(null);
        self.warnTxt(null);

        if (self.page() == 1) {
            self.forgotLogin();
            return;
        }

        if (self.page() == 2) {
            self.send();
            return;
        }

        $("#forgotModal").modal('hide');
    };

    this.forgotLogin = function() {
        self.warnTxt("");
        self.errorTxt("");
        
        if(self.forgetTimer()!==null)
            return;
        
        if (!self.searchTxt) {
            self.warnTxt("Der skal indtastes brugernavn, e-mail, mobilnummer eller kundenummer, før vi kan sende dine brugeroplysninger.");
            return;
        }

        var s = self.searchTxt;       	
        
        var url = 'activation/forgot/' + mainModel.youseeSession.session + "?search=" + s;

        var error = function(xhr, status, error) {
            //console.info(status);
            if (xhr.status === 404) {
                self.warnTxt("Vi kan ikke finde et Login som matcher de indtastede oplysninger. Prøv igen.");
            } else if (xhr.status === 409) {
                var time =  JSON.parse(xhr.responseText).wait;

                self.forgetTimer('run');
                $('#waitTime').text(time);
                $('#searchBtn').addClass('.disabled');
                 var interval = setInterval(function() {
                    if (time > 0) {
                        $('#waitTime').text(time--);
                    } else {
                        clearInterval(interval);
                        $('#searchBtn').removeClass('.disabled');
                        self.forgetTimer(null);
                    }
                }, 1000);

            } else {
                self.errorTxt("Der er opstået en fejl, prøv igen senere.");
            }
        };

        var data = $.callSyncJSON(url, "GET", null, error);

        //console.info(data);

        if (data) {
            self.youseeSession = data;

            if(data.isp) {
                var str = "Kontakt " + data.isp + " vedr. din Aktiveringskode på " + data.phone 
                if(data.mail) {
                    str += " eller " + data.mail
                }
                self.warnTxt(str);
                return;
            }

            var types = data.sendusing;

            if (!types.contains("LETTER")) {
                self.errorTxt("Der angivne login kan ikke bruges til at aktivere bredbånd.");
                return;
            }    
            if(!types.contains("SMS") && isCwifi) {
                self.cwifi(true);
            }
            if (types.contains("SMS") || types.contains("EMAIL")) {
                jQuery.each(types, function(index, value) {

                    var option = self.availableTypesMap[value];
                    if (option)
                        self.types.push(option);

                });

                self.page(2);
            } else {
                self.warnTxt("Vi har ingen kontaktoplysninger tilknyttet abonnementet og kan derfor ikke sende dig dine brugeroplysninger. For yderligere hjælp kontakt YouSee Support på telefon: 70 70 40 40");
            }
        }

    };

    this.send = function() {
        self.warnTxt("");
        self.errorTxt("");
        var input = {
            sendusing: self.type
        };
        var url = 'activation/forgot/' + mainModel.youseeSession.session;
        var data = $.callSyncJSON(url, "POST", input, function(xhr, status, error) {
            //console.info(status);

            if (xhr.status === 406) {
                self.warnTxt("Der er opstået en fejl. Prøv igen.");
            } else {
                self.errorTxt("Der er opstået en fejl, prøv igen senere.");
            }
        });

        //console.info(data);
        if (data) {
            self.youseeSession = data;
            self.page(3);
        }

    };
    
    this.closeForgot = function() {
        $("#forgotModal").modal('hide');
    };
}

