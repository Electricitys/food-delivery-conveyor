const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const WebSocket = require("ws");
const path = require("path");

const wss = new WebSocket.Server({ server });
const port = 3030;

app.use(express.static(path.join(__dirname, 'public/build')));

class Kamar {
  constructor(name, socket) {
    this.name = name;
    this.socket = socket;
    console.log("kamar");
    socket.addEventListener("message", (e) => {
      console.log(`${name} message`, e.data);
    });
  }
}

class Table {
  constructor(socket) {
    this.name = name;
    this.socket = socket;
    console.log("table");
    socket.addEventListener("message", (e) => {
      console.log(`${name} message`, e.data);
    });
  }
}

const clientList = new Map();

class Dapur {
  socket = null;
  constructor(socket) {
    this.socket = socket;
    socket.addEventListener("message", (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case "TO":
          this.goTo(msg.id)
          break;
        case "GET-CLIENT":
          this.getClient();
          break;
      }
    });
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
}

let dapur = null;
let table = null;

wss.on("connection", (ws) => {
  ws.send("coba");
  ws.on("message", function (message) {
    try {
      const msg = JSON.parse(message.toString());
      if (msg.type === "AUTH") {
        switch (msg.role) {
          case "KAMAR":
            clientList.set(msg.id, new Kamar(msg.id, ws));
            break;
          case "INTERFACE":
            dapur = new Dapur(ws);
            break;
          case "TABLE":
            table = new Table(ws);
            break;
        }
      }
    } catch (error) {
      console.error(error);
    }
  })
})

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
