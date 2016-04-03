"use strict";
function MailModel(tdcMail) {
    var self = this;

    self.alias = ko.observable('');
    self.password = ko.observable('');
    self.domains = ko.observableArray();

    this.init = function() {
        var url = "activation/mail/" + mainModel.youseeSession.session;
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            success: function(data, status, xhr) {
                console.info(data);
                if (xhr.status === 201) { //already created
                    $('#modalDialog').modal('hide');
                    mainModel.youseeSession = data;
                    mainModel.statusModel.loadServices();
                } else {
                    //mainModel.youseeSession = data;
                    self.domains(data.domains);
                }
            },
            error: function(xhr, status, error) {
                console.info(xhr);
                //ErrorPopup
                self.domains(['Fejl i hent domæne']);
                $('#errorDownTDC').show();
            },
            async: true
        });
    };

    this.createMail = function() {
        $('#createTdcMail').button('loading');
        var url = "activation/mail/" + mainModel.youseeSession.session;
        var input = {
            mail: self.alias() + '@' + $('#domains').val(),
            password: self.password()
        };

        $.ajax({
            type: 'POST',
            url: url,
            dataType: 'json',
            data: JSON.stringify(input),
            contentType: 'application/json',
            success: function(data, status, xhr) {
                console.info(data);
                mainModel.youseeSession = data;

                var mail = {
                    Alias: input.mail,
                    password: input.password
                };
                tdcMail(mail);
                $('#createTdcMail').button('reset');
                $('#modalDialog').modal('hide');
            },
            error: function(xhr, status, error) {
                console.info(xhr);
                //ErrorPopup   
                if (xhr.status === 400) {
                    var doc = JSON.parse(xhr.responseText);
                    var s = doc.statuscode;
                    $('#' + s).show();
                } else if (xhr.status === 409) {
                    $('#TDCMAIL-2').show();
                } else {
                    $('#errorDownTDC').show();
                }
                $('#createTdcMail').button('reset');
            },
            async: true
        });
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

        if (!emailOK) {
            $('#aliasError').addClass('error');
        }
        else {
            $('#aliasError').removeClass('error');
            $('#alias').attr('title','Ok');
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
        
        if(passwordOK) {
            $('#passwordError').removeClass('error');
            $('#password').attr('title','Ok');
        } else {
            $('#passwordError').addClass('error');          
        }
    });
}


