'use strict';

/*
# Respsonse Format

Outbound:
Date;CALL;ConnectionId;Extension;CallerId;CalledPhoneNumber;

Inbound:
Date;RING;ConnectionId;CallerId;CalledPhoneNumber;

Connected:
Date;CONNECT;ConnectionId;Extension;Number;

Disconnected:
Date;DISCONNECT;ConnectionID;DurationInSeconds;
*/

var net    = require('net');
var events = require('events');
var moment = require('moment');

var CallMonitor = function (host, port) {
  var self = this;
  this.call = {};
  events.EventEmitter.call(this);

  function parseMessage(message) {
    message = message
              .toString()
              .toLowerCase()
              .replace(/[\n\r]/g, '')
              .replace(/[\n\r]/)
              .replace(/;$/, '')
              .split(';');
    message[0] = moment(message[0], 'DD.MM.YY HH:mm:ss').unix();
    return message;
  }

  var client = net.createConnection(port, host);

  client.addListener('data', function (chunk) {
    var data = parseMessage(chunk);

    if (data[1] === 'ring') {
      self.call[data[2]] = {
        type: 'inbound',
        start: data[0],
        caller: data[3],
        called: data[4]
      };
      self.emit('inbound', {
        time: data[0],
        caller: data[3],
        called: data[4]
      });
      return;
    }

    if (data[1] === 'call') {
      self.call[data[2]] = {
        type: 'outbound',
        start: data[0],
        extension: data[3],
        caller: data[4],
        called: data[5]
      };
      self.emit('outbound', {
        time: data[0],
        extension: data[3],
        caller: data[4],
        called: data[5]
      });
      return;
    }

    if (data[1] === 'connect') {
      self.call[data[2]]['connect'] = data[0];
      self.emit('connected', {
        time: data[0],
        extension: self.call[data[2]]['extension'],
        caller: self.call[data[2]]['caller'],
        called: self.call[data[2]]['called']
      });
    }

    if (data[1] === 'disconnect') {
      self.call[data[2]].disconnect = data[0];
      self.call[data[2]].duration   = parseInt(data[3], 10);

      var call = self.call[data[2]];
      delete(self.call[data[2]]);
      self.emit('disconnected', call);
    }

  });

  client.addListener('end', function () {
    client.end();
  });
};

CallMonitor.prototype = new events.EventEmitter();

module.exports = CallMonitor;
