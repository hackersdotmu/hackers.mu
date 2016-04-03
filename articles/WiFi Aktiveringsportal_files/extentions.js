jQuery.ajaxSetup({
    beforeSend: function(jqXHR) {
        $('#loadingmessage').show();
    },
    complete: function() {
        $('#loadingmessage').hide();
    }
});

jQuery.callSyncJSON = function(url, method, input, error) {
    var result = null;
    var success = function(data) {
        result = data;
    };

    $.postJSON(url, method, input, success, error, false);

    return result;

};

jQuery.callASyncJSON = function(url, method, input, success, error) {
    $.postJSON(url, method, input, success, error, true);
};

jQuery.postJSON = function(url, method, input, success, error, async, beforeSend) {

    var options = {
        type: method,
        url: url,
        dataType: 'json',
        data: JSON.stringify(input),
        contentType: 'application/json',
        success: success,
        error: error,
        async: async
    };

    $.ajax(options);

};

jQuery.loadHTML = function(elementId, content, model) {
    var doc = document.getElementById(elementId);
    if (doc != null)
        ko.cleanNode(doc);

    $('#' + elementId).load(content + "?" + new Date().getTime(), function() {
        ko.applyBindings(model, doc);

        if (model.init) {
            model.init();
        }

        $('#' + elementId).modal();
    });

};


if (!window.console) {
    console = {
        log: function(msg) {
            //alert(msg);
        },
        info: function(msg) {
            //alert(msg);
        }
    };
}


Array.prototype.contains = function ArrayContains(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};

$('i').hover(function() {
    $(this).css('opacity', '.5');
    var title = $(this).attr('title');
    if(title)
        $(this).parent().append('<div class="title">' + title + '</div>');
}, function() {
    (this).css('opacity', '1');
    $(this).next().remove('.title');
});
