const express = require('express');
const path = require("path");
const { Server } = require("./Server");

const app = new Server();

app.use(express.static(path.join(__dirname, 'public/build')));

app.on("connection", (ws) => {

})

// setInterval(()=> {
//   if(table && table.socket) {
//     // console.log(table.socket);
//     table.publish("1:1");
//   }
// }, 2000);

module.exports = app;