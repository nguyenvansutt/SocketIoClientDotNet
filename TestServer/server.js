﻿var
  ssl = true,
  express = require('express'),
  expect = require('expect.js'),
  config = require('./../grunt/config.json'),
  app = express(),
  fs = require('fs'),
  options = {
      key: fs.readFileSync(__dirname + '/testme.quobject.com.key'),
      cert: fs.readFileSync(__dirname + '/testme.quobject.com.cert'),
      requestCert: true
  },
  io,
  io_ssl,
  https,
  http,
  slice = Array.prototype.slice;


console.log("https port = " + config.server.ssl_port);
https = require('https').createServer(options, app);
io_ssl = require('socket.io')(https, { pingInterval: 500 });
https.listen(config.server.ssl_port, function (d) {
    console.log('socket.io server listening on port', config.server.ssl_port);
});

console.log("http port = " + config.server.port);
http = require('http').createServer(app);
io = require('socket.io')(http, { pingInterval: 500 });
http.listen(config.server.port, function () {
    console.log('socket.io server listening on port', config.server.port);
});

app.get('/', function (req, res) {
    res.sendfile('index.html');
});

io.on('connection', function (socket) {
    // simple test
    socket.on('hi', function () {
        socket.emit('hi');
    });

    // ack tests
    socket.on('ack', function () {
        socket.emit('ack', function (a, b) {
            console.log("emit ack b=" + JSON.stringify(b));
            if (a === 5 && b.b === true) {
                socket.emit('got it');
            }
        });
    });

    socket.on('getAckDate', function (data, cb) {
        cb(new Date(),5);
    });

    socket.on('getDate', function () {
        socket.emit('takeDate', new Date());
    });

    socket.on('getDateObj', function () {
        socket.emit('takeDateObj', { date: new Date() });
    });

    socket.on('getUtf8', function () {
        socket.emit('takeUtf8', 'てすと');
        socket.emit('takeUtf8', 'Я Б Г Д Ж Й');
        socket.emit('takeUtf8', 'Ä ä Ü ü ß');
        socket.emit('takeUtf8', 'utf8 — string');
        socket.emit('takeUtf8', 'utf8 — string');
    });

    // false test
    socket.on('false', function () {
        socket.emit('false', false);
    });

    // binary test
    socket.on('doge', function () {
        var buf = new Buffer('asdfasdf', 'utf8');
        socket.emit('doge', buf);
    });

    // expect receiving binary to be buffer
    socket.on('buffa', function (a) {
        if (Buffer.isBuffer(a)) socket.emit('buffack');
    });

    // expect receiving binary with mixed JSON
    socket.on('jsonbuff', function (a) {
        expect(a.hello).to.eql('lol');
        expect(Buffer.isBuffer(a.message)).to.be(true);
        expect(a.goodbye).to.eql('gotcha');
        socket.emit('jsonbuff-ack');
    });

    // expect receiving buffers in order
    var receivedAbuff1 = false;
    socket.on('abuff1', function (a) {
        expect(Buffer.isBuffer(a)).to.be(true);
        receivedAbuff1 = true;
    });
    socket.on('abuff2', function (a) {
        expect(receivedAbuff1).to.be(true);
        socket.emit('abuff2-ack');
    });

    // emit buffer to base64 receiving browsers
    socket.on('getbin', function () {
        buf = new Buffer('asdfasdf', 'utf8');
        socket.emit('takebin', buf);
    });

});

io.of('/foo').on('connection', function () {
    // register namespace
});

io.of('/timeout_socket').on('connection', function () {
    // register namespace
});

io.of('/valid').on('connection', function () {
    // register namespace
});

io.of('/asd').on('connection', function () {
    // register namespace
});

io_ssl.on('connection', function (socket) {



});