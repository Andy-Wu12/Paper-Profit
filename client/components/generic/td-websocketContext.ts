import { createContext } from 'react'
import { w3cwebsocket as W3CWebSocket } from 'websocket';

export interface WebsocketProps {
  websocket: W3CWebSocket
}

export const TD_WebsocketContext = createContext({websocket: null});

export default TD_WebsocketContext;