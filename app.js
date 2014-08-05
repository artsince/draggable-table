(function() {
    "use strict";

    var express = require('express');
    var app = express();

    app.use(express.static(__dirname + '/public'));

    console.log('Listening on 2424');
    app.listen(2424);
}());
