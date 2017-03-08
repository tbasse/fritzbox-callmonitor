'use strict';

var CallMonitor = require('./');

var fritzbox = {
  address: '192.168.178.1',
  port: '1012'
};

var monitor = new CallMonitor(fritzbox.address, fritzbox.port);

monitor.on('inbound', function (call) {
  console.log('- Incoming');
  console.log(call);
  console.log('');
});

monitor.on('outbound', function (call) {
  console.log('- Outgoing');
  console.log(call);
  console.log('');
});

monitor.on('connected', function (call) {
  console.log('- Connection Established');
  console.log(call);
  console.log('');
});

monitor.on('disconnected', function (call) {
  console.log('- Connection Ended');
  console.log(call);
  console.log('');
});

monitor.on('error', function (err) { /* handle errors here */
  console.log(err.err.code);
  if (err.err.code=="ENETUNREACH"){
      console.log('FB CallMonitor: Ethernet is not present! Please check and restart!');
  }
  if (err.err.code=="ETIMEDOUT"){
      console.log('FB CallMonitor: connection to FB@'+fritzbox.address+' Port:'+fritzbox.port+ ' not established. Reconnecting...');
      monitor = new CallMonitor(fritzbox.address, fritzbox.port);
  }

});
