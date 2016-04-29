const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const express = require('express');

var app = express();

// Create Server
const port = 1337;

 /* serves main page */
 app.get("/", function(req, res) {
    res.sendFile(__dirname + '/index.html')
 });
app.use(express.static(__dirname + '/public'));
app.listen(port, function(){
  console.log('listening on port: ' + port.toString());
});