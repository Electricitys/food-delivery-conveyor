'use strict';

class Courier {
  constructor(socket) {
    this.socket = socket;
    console.log("[TABLE] Initialization");
    socket.on("message", (e) => {
      console.log(`[TABLE] message`, e.data);
    });
    socket.on("close", () => {
      console.log("[TABLE] Disconnected");
      this.onClose();
    });
    this.publish("1:1");
  }
  publish(data) {
    this.socket.send(data);
  }
  onClose(callback = () => { }) {
    callback();
  }
}

module.exports = {
  Courier
}
