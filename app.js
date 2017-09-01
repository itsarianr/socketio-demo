var db, messages;
$(function() {
    messages = $('#messages');
    var username = prompt("please enter your name.");
    var channel = window.location.search.substring(1);
    initDb();
    var socket = io('localhost:3000', {
        query: {
            username: username,
            channel: channel
        }
    });
    var input = $('#m');
    var isTyping = false;
    $('form').submit(function() {
        isTyping = false;
        socket.emit('message', {
            username: username,
            message: input.val(),
        });
        input.val('');
        return false;
    });
    input.on('input', function() {
        if (!isTyping && input.val() != '') {
            isTyping = true;
            socket.emit('typing', {
                username: username
            });
        } else if (input.val() == '') {
            isTyping = false;
            socket.emit('type-end', {
                username: username
            });
        }
    });
    socket.on('message', function(data) {
        $('.typing-' + data.username).remove();
        appendMessage(data);
        scrollBottom();
        db.post(data);
    });
    socket.on('typing', function(data) {
        messages.append($("<li class='typing-" + data.username + "'>").text(data.username + ' is typing...'));
        scrollBottom();
    });
    socket.on('type-end', function(data) {
        $('.typing-' + data.username).remove();
    });

    function initDb() {
        db = new PouchDB('chats');
        db.allDocs({
            include_docs: true,
            decending: true
        }, function(err, result) {
            $.each(result.rows, function(index, row) {
                appendMessage(row.doc);
            })
            scrollBottom();
        });
        // PouchDB.debug.disable();
        deleteDocs();
    }

    function deleteDocs() {
        db.allDocs().then(function(result) {
            return Promise.all(result.rows.map(function(row) {
                return db.remove(row.id, row.value.rev);
            }));
        });
    }

    function appendMessage(data) {
        var time = data.datetime != undefined ? new Date(data.datetime).toLocaleTimeString() : 'unknown';
        messages.append("<li><span class='bold'>" + data.username + '</span>: ' + data.message + "<span style='float: right'>(" + time + ')</span>');
    }

    function scrollBottom() {
        $('html, body').animate({
            scrollTop: messages.prop("scrollHeight")
        }, 500);
    }
})
