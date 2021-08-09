var chatterbotUrl = '{% url "chatterbot" %}';
var csrftoken = Cookies.get('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});


// var $myPara = $('.js-text');
// var $myQas = $('.js-qas');
// var $myUrl = $('.js-url');

// var $myPara = newPara(myPara);
// var $myQas = $('.js-qas');
// var $myUrl = newURL(myUrl);

console.log('___________________________________________________')
console.log($myPara)
console.log($myQas)
console.log($myUrl)

function submitURL() {
    var inputData = {
        'myUrl': $myUrl.val()
    }
    // Display the user's input on the web page
    // createRow(inputData.text);

    var $submitUrl = $.ajax({
        type: 'POST',
        url: chatterbotUrl,
        data: JSON.stringify(inputData),
        contentType: 'application/json'
    });

    $submitUrl.done(function (statement) {
        $myUrl.val('');

        // Scroll to the bottom of the chat interface
        $chatlog[0].scrollTop = $chatlog[0].scrollHeight;
    });

    $submitUrl.fail(function () {
        // TODO: Handle errors
    });
}

function submitPara() {
    var inputData = {
        'paraTxt': $myPara.val(),
    }
    // Display the user's input on the web page
    // createRow(inputData.text);

    var $submitPara = $.ajax({
        type: 'POST',
        url: chatterbotUrl,
        data: JSON.stringify(inputData),
        contentType: 'application/json'
    });

    $submit.done(function (statement) {
        $myPara.val('');

        // Scroll to the bottom of the chat interface
        $chatlog[0].scrollTop = $chatlog[0].scrollHeight;
    });

    $submitPara.fail(function () {
        // TODO: Handle errors
    });
}

function submitQas() {
    var inputData = {
        // 'paraTxt': $myPara.val(),
        'qasTxt': $myQas.val(),
        // 'wikipediaUrl': $wikipediaUrl.val()
    }

    // Display the user's input on the web page
    // createRow(inputData.text);

    var $submitQas = $.ajax({
        type: 'POST',
        url: chatterbotUrl,
        data: JSON.stringify(inputData),
        contentType: 'application/json'
    });

    $submitQas.done(function (statement) {
        // createRow(statement.text);
        newMessage(statement.text, 'bot');
        // Clear the input field
        $myQas.val('');

        // Scroll to the bottom of the chat interface
        $chatlog[0].scrollTop = $chatlog[0].scrollHeight;
    });

    $submitQas.fail(function () {
        // TODO: Handle errors
    });
}

$myUrl.keydown(function (event) {
    // Submit the input when the enter button is pressed
    if (event.keyCode == 13) {
        submitURL();
    }
});

$myPara.keydown(function (event) {
    // Submit the input when the enter button is pressed
    if (event.keyCode == 13) {
        submitPara();
    }
});

$myQas.keydown(function (event) {
    // Submit the input when the enter button is pressed
    if (event.keyCode == 13) {
        submitQas();
    }
});