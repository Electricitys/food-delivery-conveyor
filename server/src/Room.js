'use strict';

const EventEmitter = require("events");

class Room extends EventEmitter {
  constructor(name, socket) {
    super();
    this.name = name;
    this.socket = socket;
    this.state = {
      servo: 0,
      buzzer: 0
    };
    this.SENS = {
      "PROXY": '0',
      "BTN": '1',
    }
    this.ACT = {
      "SERVO": '1',
      "BUZZER": '2',
    }
    console.log(`[ROOM ${name}] Initialization`);
    socket.on("message", (e) => {
      const data = e.toString().split(":");
      // console.log(`[ROOM ${name}] message`, data);
      if (data[0] === "1") {
        if (data[1] === this.SENS["PROXY"]) {
          this.emit("proxy", data[2]);
        }
        if (data[1] === this.SENS["BTN"]) {
          this.emit("btn", data[2]);
        }
      }
    });
    socket.on("close", () => {
      console.log(`[ROOM ${name}] Disconnected`);
      this.emit("close");
    });
  }
  publish(data) {
    this.socket.send(data);
  };
  servo(state) {
    this.state.servo = state;
    this.publish(`${this.ACT["SERVO"]}:${state}`);
  }
  buzzer(state) {
    this.state.buzzer = state;
    this.publish(`${this.ACT["BUZZER"]}:${state}`);
  }
}

module.exports = {
  Room
};
