'use strict';

const express = require('express');
const path = require("path");
const { Server } = require("./Server");
const { Room } = require("./Room");
const { Courier } = require('./Courier');
const { Control } = require('./Control');

const app = new Server();
console.log(path.join(__dirname, 'public/build'));

// app.use("/", express.static(path.join(__dirname, 'public/build')));
// app.use("/", express.static(path.join(__dirname, 'public/build')));

app.on("connection", (ws) => {
  ws.on("message", function (message) {
    try {
      const msg = (message.toString()).split(":");
      if (msg[0] === app.METHOD["AUTH"]) {
        if (msg[1] === app.ROLE["ROOM"]) {
          if (app.clientList.get(msg[2])) {
            app.clientList.delete(msg[2]);
          }
          const room = new Room(msg[2], ws);
          app.clientList.set(msg[2], room);
          app.emit("login", {
            type: "room",
            connection: room,
            data: msg[2]
          });
          room.on("close", () => {
            app.clientList.delete(msg[2]);
          });
          room.on("proxy", (data) => {
            app.emit("room", room, { type: "proxy", data });
          });
          room.on("btn", (data) => {
            app.emit("room", room, { type: "btn", data });
          });
        } else if (msg[1] === app.ROLE["TABLE"]) {
          const courier = new Courier(ws);
          app.courier = courier;
          app.emit("login", {
            type: "courier",
            connection: courier
          });
        } else if (msg[1] === app.ROLE["CONTROLLER"]) {
          const control = new Control(ws, app.port);
          app.control = control;
          app.emit("login", {
            type: "control",
            connection: control
          });
          app.control.on("to", (roomNumber) => {
            app.emit("control", app.control, { type: "to", data: roomNumber });
          });
          app.control.on("get-client", () => {
            app.emit("control", app.control, { type: "get-client" });
          })
          app.control.on("close", () => {
            app.control = null;
          })
        }
      }
    } catch (error) {
      console.error(error);
    }
  })
});

app.on("login", ({ type, data, connection }) => {
  if (type === "room") {
    let room = connection;
    room.on("proxy", (data) => {
      if (room !== app.targetRoom) return;
      console.log("tiba");
      if (data) {
        room.buzzer(0);
        if (app.courier !== null) {
          app.courier.move(0);
        }
        if (app.control !== null) {
          const d = JSON.stringify({
            type: "STATE",
            data: "Menunggu ambil pesanan"
          });
          app.control.publish(d);
        }
      }
    });
    room.on("btn", (data) => {
      if (room !== app.targetRoom) return;
      console.log("ambil");
      if (data) {
        if (app.courier !== null) {
          app.courier.move(1);
        }
        if (app.control !== null) {
          const d = JSON.stringify({
            type: "STATE",
            data: "Kembali ke dapur"
          });
          app.control.publish(d);
          app.control.servo(0);
        }
        app.targetRoom = null;
        room.servo(1);
        room.buzzer(1);
      }
    });
    if (app.control !== null) {
      const list = app.clientList.keys();
      const d = JSON.stringify({
        type: "CLIENT-LIST",
        data: Array.from(list)
      });
      app.control.publish(d);
    }
    room.on("close", () => {
      if (app.control !== null) {
        const list = app.clientList.keys();
        const d = JSON.stringify({
          type: "CLIENT-LIST",
          data: Array.from(list)
        });
        app.control.publish(d);
      }
    });
  } else if (type === "courier") {
    if (app.control !== null) {
      const d = JSON.stringify({
        type: "COURIER",
        data: 1
      });
      app.control.publish(d);
    }
    connection.on("close", () => {
      if (app.control !== null) {
        app.courier = null;
        const d = JSON.stringify({
          type: "COURIER",
          data: 0
        });
        app.control.publish(d);
      }
    })
  }
})

app.on("control", (control, { type, data }) => {
  if (type === "get-client") {
    const list = app.clientList.keys();
    const d = JSON.stringify({
      type: "CLIENT-LIST",
      data: Array.from(list)
    });
    control.publish(d);
  } else if (type === "to") {
    const room = app.clientList.get(data);
    app.targetRoom = room;
    if (app.courier !== null) {
      app.courier.move(1);
    }
    if (app.control !== null) {
      const d = JSON.stringify({
        type: "STATE",
        data: `Mengantarkan ke Kamar ${data}`
      });
      app.control.publish(d);
      app.control.servo(1);
    }
    room.servo(0);
  } else if (type === "proxy") {
    if (app.targetRoom === null) {
      const a = data === '0';
      if (a) {
        console.log("proxy data", typeof data, a);
        console.log("target room", app.targetRoom);
        if (app.control !== null) {
          const d = JSON.stringify({
            type: "STATE",
            data: `Stand by`
          });
          app.control.publish(d);
          app.control.servo(1);
        }
        if (app.courier !== null) {
          app.courier.move(0);
          return;
        }
      }
    }
  }
});

app.on("room", (room, { type, data }) => {
  if (type === "proxy") {
  } else if (type === "btn") {
  }
})

// setInterval(()=> {
//   if(table && table.socket) {
//     // console.log(table.socket);
//     table.publish("1:1");
//   }
// }, 2000);

module.exports = app;
