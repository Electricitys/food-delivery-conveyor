'use strict';

const express = require('express');
const app = express();
const http = require('http');
const WebSocket = require("ws");
const httpServer = http.createServer(app);
const EventEmitter = require('events');
const SerialPort = require("serialport");

const { Room } = require("./Room");
const { Courier } = require('./Table');
const { Control } = require('./Control');

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
    this.clientList = new Map();
    this.control = null;
    this.table = null;

    this.http = httpServer;
    this.express = app;
    this.wss = new WebSocket.Server({ server: httpServer });
    this.port = null;
    // this.port.on("data", (msg) => {
    //   // const data = JSON.stringify(msg.toString);
    //   // this.emit("");
    //   console.log("data", msg.toString());
    // });

    this.__init__();
  }
  __init__() {
    this.wss.on("connection", (ws) => {
      console.log("connection");
      const self = this;
      this.emit("connection", ws);
      ws.on("message", function (message) {
        try {
          const msg = (message.toString()).split(":");
          console.log(msg, msg[1]);
          if (msg[0] === self.METHOD["AUTH"]) {
            if (msg[1] === self.ROLE["ROOM"]) {
              clientList.set(msg[2], new Room(msg[2], ws));
            } else if (msg[1] === self.ROLE["TABLE"]) {
              this.table = new Courier(ws);
            } else if (msg[1] === self.ROLE["CONTROLLER"]) {
              this.control = new Control(ws, this.port);
            }
          }
        } catch (error) {
          console.error(error);
        }
      })
    });
  }
  use(arg) {
    this.express.use(arg);
  }

  listen({ port, serialPath }, callback = () => { }) {
    this.http.listen(port, callback);
    this.port = new SerialPort(serialPath, {
      baudRate: 115200
    }, err => {
      if (err != null) {
        // console.error(err);
        throw new Error(err);
      }
      console.log("[PORT] OPENED");
    });
  }
}

module.exports = {
  Server
}
