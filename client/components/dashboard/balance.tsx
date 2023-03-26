import { useState, useEffect } from "react";

export default function Balance({username}: {username: string}): React.ReactElement {
  const [balance, setBalance] = useState(null);
  const [websocket, setWebsocket] = useState(null);

  useEffect(() => {
    try {
      if(!websocket && username) {
        const ws = new WebSocket("ws://localhost:3011/balance");
        ws.addEventListener('open', () => { ws.send(JSON.stringify({username: username, action: 'sub'})); });
        ws.addEventListener('message', (event) => {
          setBalance(event.data);
          // ws.send(username);
        })
        setWebsocket(ws);
      }
    } catch (e) {
      setWebsocket(null);
    }
  });

  return (
    <>
      {balance && <h2> Your Remaining Cash: {parseFloat(balance).toFixed(2)} </h2>}
    </>
  )
}