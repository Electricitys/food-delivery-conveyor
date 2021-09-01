'use strict';

const EventEmitter = require("events");

class Control extends EventEmitter {
  socket = null;
  constructor(socket, port) {
    this.socket = socket;
    this.port = port;
    console.log("[CTRL] Initialization");
    socket.on("message", (e) => {
      const msg = e.split(":");
      switch (msg[0] === METHOD["ACTION"]) {
        case "TO":
          this.goTo(msg.id)
          break;
        case "GET-CLIENT":
          this.getClient();
          break;
      }
    });
    socket.on("close", () => {
      console.log("[CTRL] Disconnected");
      this.onClose();
    });

    this.port.on("data", (data) => {
      console.log(data);
      this.emit("data", data);
    })
  }
  goTo(id) {
    const kamar = clientList.get(id);
    console.log(kamar);
  }
  getClient() {
    const list = clientList.keys();
    this.socket.send(JSON.stringify({
      type: "CLIENT-LIST",
      data: Array.from(list)
    }))
  }
  onClose(callback = () => { }) {
    callback();
  }
}

module.exports = {
  Control
};
