const app = require("./app");
const SerialPort = require("serialport");

const port = 3030;

app.listen(port, async () => {
  try {
    let ports = await SerialPort.list();

    console.log(`Available port (${ports.length})`);
    ports.forEach(console.log);
  } catch (err) {
    console.error(err);
  }
  console.log(`\nlistening on *:${port}`);
});