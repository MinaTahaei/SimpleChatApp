$(function () {
    "use strict";
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');


    var myColor = false;
    var myName = false;

    // for firefox - built in websocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    var connection = new WebSocket('ws://127.0.0.1:1337');

    connection.onopen = function () {
        input.removeAttr('disabled');
        status.text('Choose name:');
    };

    // incoming messages
    connection.onmessage = function (message) {
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
        if (json.type === 'color') { 
            myColor = json.data;
            status.text(myName + ': ').css('color', myColor);
            input.removeAttr('disabled').focus();
        } else if (json.type === 'history') {
            // insert message to the chat window
            for (var i=0; i < json.data.length; i++) {
                addMessage(json.data[i].author, json.data[i].text,
                           json.data[i].color, new Date(json.data[i].time));
            }
        } else if (json.type === 'message') { 
            input.removeAttr('disabled'); //user writes another message
            addMessage(json.data.author, json.data.text,
                       json.data.color, new Date(json.data.time));
        } else {
            console.log('Error');
        }
    };
    //send on enter
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            connection.send(msg);
            $(this).val('');
            input.attr('disabled', 'disabled');
            if (myName === false) {
                myName = msg;
            }
        }
    });


    function addMessage(author, message, color, dt) {
        content.prepend('<p><span style="color:' + color + '">' + author + '</span> @ ' +
             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ': ' + message + '</p>');
    }
});