'use strict';

const EventEmitter = require("events");

class Courier extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this.state = {
      move: 0,
    }
    console.log("[COURIER] Initialization");
    socket.on("message", (e) => {
      console.log(`[COURIER] message`, e.data);
    });
    socket.on("close", () => {
      console.log("[COURIER] Disconnected");
      this.emit("close");
    });
    this.publish("1:1");
  }
  publish(data) {
    this.socket.send(data);
  }
  move(data) {
    this.state.move = data;
    this.publish(`1:${data}`)
  };
}

module.exports = {
  Courier
}
