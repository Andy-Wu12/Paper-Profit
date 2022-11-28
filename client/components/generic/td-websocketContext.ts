import { createContext } from 'react'

export interface WebsocketProps {
  websocket: WebSocket
}

export const TD_WebsocketContext = createContext({websocket: null});

export default TD_WebsocketContext;