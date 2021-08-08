import { useEffect, useState } from 'react';
import './App.css';
import AspectRatio from './components/AspectRatio';
import { useClient } from './components/client';

const Button = ({ children, ...props }) => {
  return (
    <button {...props}>
      <AspectRatio ratio="1:1">
        <div className="content">
          {children}
        </div>
      </AspectRatio>
    </button>
  )
}

function App() {
  const client = useClient();
  const [list, setList] = useState([]);
  const [action, setAction] = useState("Mengantarkan");

  const checkClient = () => {
    client.send(JSON.stringify({ type: "GET-CLIENT" }));
  }

  useEffect(() => {
    client.on("message", (e) => {
      try {
        const msg = JSON.parse(e.data);
        switch (msg.type) {
          case "CLIENT-LIST":
            setList(msg.data);
            break;
          default:
            break;
        }
      } catch (err) { }
    })
    client.login();
  }, [client]);

  const toDapur = (id) => {
    const data = {
      type: "TO",
      data: id
    }
    client.send(JSON.stringify(data));
  }

  return (
    <div className="App">
      <button
        onClick={() => checkClient()}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          borderRadius: 0,
          backgroundColor: "transparent",
          border: "1px solid black",
          borderTop: "0",
          borderRight: "0",
        }}
      >refresh</button>
      <div className="text">
        <div>Action:</div>
        <div style={{ fontSize: 25, fontFamily: "monospace" }}>{action}</div>
      </div>
      <div className="buttons">
        {[1, 2, 3, 4].map((id) =>
          <Button
            key={id}
            className="button"
            onClick={() => toDapur(id)}
            disabled={list.indexOf(id) === -1}
          >
            <div style={{ fontSize: "50%" }}>Kamar</div>
            <div>{id}</div>
          </Button>)}
        <Button
          className="button"
          style={{ fontSize: 25 }}
        >ABORT</Button>
      </div>
    </div >
  );
}

export default App;
