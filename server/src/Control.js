'use strict';

const EventEmitter = require("events");

class Control extends EventEmitter {
  socket = null;
  constructor(socket, port) {
    super();
    this.state = {
      servo: 0,
    };
    this.socket = socket;
    this.port = port;
    console.log("[CTRL] Initialization");
    socket.on("message", (e) => {
      const msg = e.toString().split(":");
      if (msg[0] === "TO") {
        this.emit("to", msg[1]);
      } else if (msg[0] === "GET-CLIENT") {
        console.log(msg);
        this.emit("get-client");
      }
    });
    socket.on("close", () => {
      console.log("[CTRL] Disconnected");
      this.emit("close");
    });

    this.port.on("data", (data) => {
      console.log(data);
      this.emit("data", data);
    });
  }
  publish(data) {
    this.socket.send(data);
  }
  send(data) {
    this.port.write(data);
  }
  servo(state) {
    this.state.servo = state;
    this.send(`1:${state}`);
  }
}

module.exports = {
  Control
};
