"use strict";
function UdstyrModel(statusModel, cpes) {
    var self = this;
    
    this.statusModel = statusModel;
    
    self.udstyr = ko.observableArray(cpes);
    
    self.removeDevice = function(device) {
    	console.info(device);
    	
    	var success = function(data, status, xhr) {
            mainModel.youseeSession = data;
            $('#modalDialog').modal('hide');
    	};
    	
        var error = function(xhr, status, error) {
            console.info(xhr);
            var data = JSON.parse(xhr.responseText);
            mainModel.youseeSession = data;
            mainModel.errorTxt("Der er opstået en fejl, prøv igen senere.");
            mainModel.nextSite("LOGIN");
        };

    	
    	$.callASyncJSON(device.deletecpelink.uri.replace("/api",""), device.deletecpelink.http, device, success, error);
    	
    	
    };
        
}


