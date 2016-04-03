"use strict";
function ForeningsmailModel(statusModel, pos) {
    var self = this;

    self.statusModel = statusModel;
    self.pos = pos;
    self.alias = ko.observable('');
    self.password = ko.observable('');
    self.domains = ko.observableArray();
    self.notAllowed = ko.observable(false);
    self.postLink;

    this.init = function() {
        var url2 = "activation/Foreningsmail/" + mainModel.youseeSession.session + "?pos=" + self.pos;

        var success = function(data, status, xhr) {
            console.info(data);
            mainModel.youseeSession = data;
            self.statusModel.loadServices();

            var s = data.smpservices;
            if (s !== null) {
                jQuery.each(s, function(index, value) {
                    if (value.type === "Foreningsmail" && value.position === pos) {
                        self.domains(value.domains);
                        self.postLink = value.next.uri;
                        if (value.notallowed) {
                            self.notAllowed(true);
                        }
                    }
                });
            }
        };
        var error = function(xhr, status, error) {
            console.info(xhr);
            //ErrorPopup
            $('#errorDownFM').show();
        };

        $.callASyncJSON(url2, 'GET', null, success, error);
    };

    this.createMail = function() {
        $('#createFmMail').button('loading');
        var input = {
            alias: self.alias(),
            password: self.password(),
            domain: $('#domains').val(),
            pos: self.pos
        };

        var url = "activation/Foreningsmail/" + mainModel.youseeSession.session;

        var success = function(data, status, xhr) {
            console.info(data);
            mainModel.youseeSession = data;
            var mail = self.alias() + '@' + input.domain;
            var result = {
                position: self.pos,
                email: [mail],
                password: self.password()
            };

            self.statusModel.foreningsmail.push(result);
            self.statusModel.loadServices();

            $('#createFmMail').button('reset');
            $('#modalDialog').modal('hide');
        };

        var error = function(xhr, status, error) {
            //ErrorPopup
            if (xhr.status === 406) {
                //handle backend error msg
                var doc = JSON.parse(xhr.responseText);
                var s = doc.statuscode;
                $('#' + s).show();
            } else if (xhr.status === 409) {
                var doc = JSON.parse(xhr.responseText);
                self.setErrorMsgFromCode(doc.Error);
                $('#FM-3').show();
            } else {
                $('#errorDownFM').show();
            }
            $('#createFmMail').button('reset');
        };

        $.callASyncJSON(url, 'POST', input, success, error);
    };

    self.setErrorMsgFromCode = function(error) {
        switch (error) {
            case 1:
                $('#FM-3P').text("E-mail-adressen må ikke indeholde specialtegn. Prøv igen.");
                break;
            case 2:
                $('#FM-3P').text("Adgangskoden skal være imellem 6-12 tegn. Prøv igen.");
                break;
            case 3:
                $('#FM-3P').text("Adgangskoden må maksimalt indeholde 12 tegn. Prøv igen.");
                break;
            case 5:
                $('#FM-3P').text("Domænet findes ikke. Prøv igen.");
                break;
            case 19:
                $('#FM-3P').text("E-mail-adressen er optaget.");
                break;
            case 32:
                $('#FM-3P').text("Fejl i Adgangskode må ikke indeholde specialtegn. Prøv igen.");
                break;
            case 33:
                $('#FM-3P').text("Du har allerede opbrugt din kvote af gratis E-mail-adresser.");
                break;
            case 404:
                $('#FM-3P').text("Ukendt fejl ved hentning af data (2), prøv venligst igen senere.");
                break;
            case 660:
                $('#FM-3P').text("E-mail-adressen og adgangskoden må ikke være den samme.");
                break;
        }
    };

    self.alias.subscribe(function(newValue) {
        var emailOK = true;

        if (newValue.length < 2) {
            emailOK = false;
            $('#alias').attr('title', 'Adressen er for kort');
        }

        // Rule no. 2 - Maximum length 32 characters
        if (newValue.length > 32) {
            emailOK = false;
            $('#alias').attr('title', 'Adressen må maksimalt være 32 tegn');
        }

        // Rule no. 3 - Must contain only letters a..z, A..Z, 0..9 and specific characters
        var pattern4 = new RegExp("^[a-zA-Z0-9\.\_\-]+$");
        if (!pattern4.test(newValue)) {
            emailOK = false;
            $('#alias').attr('title', 'Tjek din mail-adresse for ugyldige tegn');
        }
        
        if (newValue.indexOf("@") !== -1) {
            emailOK = false;
            $('#alias').attr('title', 'Tjek din mail-adresse for ugyldige tegn');
        }

        if (!emailOK) {
            $('#aliasError').addClass('error');
        }
        else {
            $('#aliasError').removeClass('error');
            $('#alias').attr('title', 'Ok');
        }
    });

    self.password.subscribe(function(newValue) {
        var passwordOK = true;
        if (newValue.length >= 8 && newValue.length <= 12) {
            $('#img11').attr({src: '../img/check.gif', title: 'OK'});
        }
        else {
            $('#img11').attr('src', '../img/cross.gif');
            passwordOK = false;
        }

        var pattern5 = new RegExp("^[A-Za-z0-9\"\.!\%\$\(\)\?~>=;:\^,\*\+/\|\{\}_'-]+$");
        if (pattern5.test(newValue)) {
            $('#img12').attr({src: '../img/check.gif', title: 'OK'});
        } else {
            $('#img12').attr('src', '../img/cross.gif');
            passwordOK = false;
        }

        var pattern1 = new RegExp("[a-z]+");
        if (pattern1.test(newValue)) {
            $('#img13').attr({src: '../img/check.gif', title: 'OK'});
        } else {
            $('#img13').attr('src', '../img/cross.gif');
            passwordOK = false;
        }

        var pattern1 = new RegExp("[A-Z]+");
        if (pattern1.test(newValue)) {
            $('#img17').attr({src: '../img/check.gif', title: 'OK'});
        } else {
            $('#img17').attr('src', '../img/cross.gif');
            passwordOK = false;
        }

        var pattern2 = new RegExp("(?:\\d.*){2,}");
        if (pattern2.test(newValue)) {
            $('#img14').attr({src: '../img/check.gif', title: 'OK'});
        }
        else {
            $('#img14').attr('src', '../img/cross.gif');
            passwordOK = false;
        }

        var pattern3 = new RegExp("([A-Za-z0-9\"\.!\%\$\(\)\?~>=;:\^,\*\+/\|\{\}_'-])\\1{2}");
        if (!pattern3.test(newValue)) {
            $('#img15').attr({src: '../img/check.gif', title: 'OK'});
        }
        else {
            $('#img15').attr('src', '../img/cross.gif');
            passwordOK = false;
        }
        
        if(!passwordOK) {
            $('#passwordError').addClass('error');
        } else {
            $('#passwordError').removeClass('error');
            $('#password').attr('title','Ok');
        }
    });



}


