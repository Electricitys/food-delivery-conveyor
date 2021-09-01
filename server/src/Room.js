class Room {
  constructor(name, socket) {
    this.name = name;
    this.socket = socket;
    console.log(`[ROOM ${name}] Initialization`);
    socket.on("message", (e) => {
      console.log(`[ROOM ${name}] message`, e.data);
    });
    socket.on("close", () => {
      console.log(`[ROOM ${name}] Disconnected`);
      clientList.delete(this.name);
    });
  }
  publish(data) {
    this.socket.send(data);
  };
  onClose(callback = () => { }) {
    callback();
  }
}

module.exports = {
  Room
};