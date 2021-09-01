'use strict';

const app = require("./app");
const SerialPort = require("serialport");
const parser = require("./argsparse");

parser.add_argument("-r", "--run", { help: "Start atau Check Port", default: "start" });
parser.add_argument("-p", "--port", { help: "Port", type: "int", default: 3030 });

const args = parser.parse_args();
const port = args["port"];

if (args["run"] === "start") {
  app.listen(port, () => {
    console.log(`\nlistening on *:${port}`);
  });
} else if (args["run"] === "check-port") {
  SerialPort.list().then(ports => {
    console.log(`Available port (${ports.length})`);
    ports.forEach(console.log);
  });
}
