import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ClientContext = createContext(null);

export const ClientProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socket = useMemo(() => {
    const ws = new WebSocket("ws://localhost:3030");
    ws.addEventListener("open", () => {
      setIsConnected(true);
    })
    return ws;
  }, []);

  const login = useCallback((cb = () => { }) => {
    if (!isConnected) return;
    if (socket.OPEN) {
      console.log(socket.OPEN, socket.CONNECTING);
      socket.send("0:C");
    }
    setIsConnected(true);
    cb();
  }, [isConnected]);

  return (
    <ClientContext.Provider value={{
      socket,
      login,
      on: socket.addEventListener.bind(socket),
      send: socket.send.bind(socket),
      _connected: isConnected
    }}>
      {children}
    </ClientContext.Provider>
  )
}

export const useClient = () => {
  const client = useContext(ClientContext);
  return client;
}