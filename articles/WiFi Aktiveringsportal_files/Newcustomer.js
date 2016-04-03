"use strict";
function Newcustomer(statusModel) {
    var self = this;
    self.validationOK = true;

    self.yousee = statusModel.yousee;
    self.user = ko.observable();
    self.password = ko.observable();
    self.mail = ko.observable();
    self.mobil = ko.observable();


    this.init = function() {
        self.user(mainModel.youseeSession.yspro_userinfo.UserLogin);
        self.mail(mainModel.youseeSession.yspro_userinfo.EmailAddress);
        self.mobil(mainModel.youseeSession.yspro_userinfo.CellPhone);
    };

    this.createYs = function() {
        var input = {
            username: self.user(),
            email: self.mail(),
            mobil: self.mobil()
        };

        if (self.yousee().password) {
            input.password = self.password();
        }

        var url = "activation/login/" + mainModel.youseeSession.session;

        var error = function(xhr, status, error) {
            var data = null;
            try {
                data = JSON.parse(xhr.responseText);
            } catch (e) {
                console.info(e);
            }

            if (xhr.status === 406 && data) { //Input error
                var str;
                if (data.message)
                    str = data.message;

                if (data.statuscode)
                    str = data.statuscode;

                switch (str) {
                    case "login-91":
                        $('#inputNewSpan').text('Fejl i mobil.');
                        break;
                    case "login-92":
                        $('#inputNewSpan').text('Brugnavnet er ikke ledigt.');
                        break;
                    case "login-93":
                        $('#inputNewSpan').text('Fejl i password.');
                        break;
                    case "login-94":
                        $('#inputNewSpan').text('Det indtastet er ikke en valid E-mail! Pr&oslash;v igen.');
                        break;
                    case "login-95":
                        $('#inputNewSpan').text('Fejl i brugernavn.');
                        break;
                    case "login-96":
                        $('#inputNewSpan').text('Fejl i password.');
                        break;
                    case "login-97":
                        $('#inputNewSpan').text('Fejl i input');
                        break;
                    case "login-99":
                        $('#inputNewSpan').text('Adgang nægtet!');
                        break;
                }

                $('#inputNew').show();
            } else {
                //ErrorPopup
                $('#errorNewDown').show();
            }
        };

        var data = $.callSyncJSON(url, 'PUT', input, error);
        if (data) {
            console.info(data);
            mainModel.youseeSession = data;
            statusModel.youseeLogin(input);
            statusModel.yousee(false);
            $('#modalDialog').modal('hide');
        }

    };

    self.user.subscribe(function(newValue) {
        var upattern1 = new RegExp("^[A-Za-z0-9_@.\x2D]+$");
        if (upattern1.test(newValue) && newValue.length >= 3 && newValue.length <= 32) {
            $('#userError').removeClass('error');
            $('#user').attr('title', 'Ok');
        }
        else {
            $('#userError').addClass('error');
            self.validationOK = false;
        }
    });

    self.mail.subscribe(function(newValue) {
        var epattern1 = new RegExp("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$");
        if (!epattern1.test(newValue)) {
            self.validationOK = false;
            $('#emailError').addClass('error');
        } else {
            $('#emailError').removeClass('error');
            $('#email').attr('title', 'Ok');
        }
    });

    self.mobil.subscribe(function(newValue) {
        var mobilOk = true;
        var cpattern1 = new RegExp("^[0-9]*$");
        if (!cpattern1.test(newValue))
        {
            self.validationOK = false;
            mobilOk = false;
        }

        if (newValue.length !== 0 && newValue.length !== 8)
        {
            self.validationOK = false;
            mobilOk = false;
        }

        if (mobilOk) {
            $('#mobilError').removeClass('error');
            $('#mobil').attr('title','Ok');
        } else {
            $('#mobilError').addClass('error');
        }
    });

    self.password.subscribe(function(newValue) {
        var passwordOk = true;
        if (newValue.length >= 8 && newValue.length <= 32) {
            document.getElementById('img11').src = "img/check.gif";
            document.getElementById('img11').title = "OK";
        }
        else {
            document.getElementById('img11').src = "img/cross.gif";
            passwordOk = false;
        }

        // Rule no. 3 - Must contain only letters a..z, A..Z, 0..9 and specific characters
        var pattern4 = new RegExp("^[A-Za-z0-9\"\.!\%\$\(\)\?~>=;:\^,\*\+/\|\{\}_'-]+$");
        if (pattern4.test(newValue)) {
            document.getElementById('img12').src = "img/check.gif";
        }
        else {
            document.getElementById('img12').src = "img/cross.gif";
            passwordOk = false;
        }

        // Rule no. 4 - Must contain at least one small letter a..z
        var pattern1 = new RegExp("[a-z]+");
        if (pattern1.test(newValue)) {
            document.getElementById('img13').src = "img/check.gif";
            document.getElementById('img13').title = "OK";

        }
        else {
            document.getElementById('img13').src = "img/cross.gif";
            passwordOk = false;
        }

        // Rule no. 5 - Must contain at least one digit 0..9
        var pattern2 = new RegExp("(?:\\d.*){2,}");
        if (pattern2.test(newValue)) {
            document.getElementById('img14').src = "img/check.gif";
            document.getElementById('img14').title = "OK";
        }
        else {
            document.getElementById('img14').src = "img/cross.gif";
            passwordOk = false;
        }

        // Rule no. 6 - No two equal characters side by side
        var pattern3 = new RegExp("([A-Za-z0-9\"\.!\%\$\(\)\?~>=;:\^,\*\+/\|\{\}_'-])\\1{2}");
        if (!pattern3.test(newValue)) {
            document.getElementById('img15').src = "img/check.gif";
            document.getElementById('img15').title = "OK";
        }
        else {
            document.getElementById('img15').src = "img/cross.gif";
            passwordOk = false;
        }

        // Rule no. 7 - Must contain at least one Big letter a..z
        var pattern1 = new RegExp("[A-Z]+");
        if (pattern1.test(newValue)) {
            document.getElementById('img17').src = "img/check.gif";
            document.getElementById('img17').title = "OK";
        }
        else {
            document.getElementById('img17').src = "img/cross.gif";
            passwordOk = false;
        }
        
        if(passwordOk) {
            $('#passwordError').removeClass('error');
            $('#password').attr('title','Ok');
        } else {
            $('#passwordError').addClass('error');
        }
    });
}