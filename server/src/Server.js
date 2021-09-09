'use strict';

const express = require('express');
const app = express();
const http = require('http');
const WebSocket = require("ws");
const httpServer = http.createServer(app);
const EventEmitter = require('events');
const SerialPort = require("serialport");

class Server extends EventEmitter {
  constructor() {
    super();
    this.METHOD = {
      "AUTH": '0',
      "ACTION": '1',
      "STATE": '2'
    }
    this.ROLE = {
      "TABLE": "T",
      "ROOM": "R",
      "CONTROLLER": "C",
    }
    this.state = "Stand By";
    this.clientList = new Map();
    this.control = null;
    this.courier = null;

    this.targetRoom = null;

    this.http = httpServer;
    this.express = app;
    this.wss = new WebSocket.Server({ server: httpServer });
    this.port = null;

    this.__init__();
  }
  __init__() {
    this.wss.on("connection", (ws) => {
      console.log("connection");
      this.emit("connection", ws);
    });
  }

  clients(cb = () => { }) {
    this.clientList.forEach(cb);
  }

  use(...args) { return this.express.use(...args) }

  listen({ port, serialPath }, callback = () => { }) {
    this.http.listen(port, callback);
    this.port = new SerialPort(serialPath, {
      baudRate: 115200
    }, err => {
      if (err != null) {
        console.error(err);
        throw new Error(err);
      }
      console.log("[PORT] OPENED");
    });
    if (this.port) {
      this.port.on("data", (msg) => {
        let data = msg.toString().split(":");
        if (data[0] === '1') {
          if (this.control) {
            this.emit("control", this.control, { type: "proxy", data: data[1] });
          }
        }
      });
    }
  }
}

module.exports = {
  Server
}
