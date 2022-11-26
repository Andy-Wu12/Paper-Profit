import userPrincipals from '../../pages/api/userprincipal.json'

import { IMessageEvent, w3cwebsocket as W3CWebSocket } from 'websocket';
import { WebsocketProps } from './td-websocketContext';

// Utility
function jsonToQueryString(json: any): string {
  return Object.keys(json).map(function(key) {
    return encodeURIComponent(key) + '=' +
        encodeURIComponent(json[key]);
  }).join('&');
}

const userPrincipalsResponse = userPrincipals

export function createWebsocket(refObj: WebsocketProps, { onOpen=()=> {}, onMessage=(evt: IMessageEvent)=> {}, onClose=()=> {}, onError=()=> {}} = {}): void {
  //Converts ISO-8601 response in snapshot to ms since epoch accepted by Streamer
  const tokenTimeStampAsDateObj = new Date(userPrincipalsResponse.streamerInfo.tokenTimestamp);
  const tokenTimeStampAsMs = tokenTimeStampAsDateObj.getTime();
  
  const credentials = {
    "userid": userPrincipalsResponse.accounts[0].accountId,
    "token": userPrincipalsResponse.streamerInfo.token,
    "company": userPrincipalsResponse.accounts[0].company,
    "segment": userPrincipalsResponse.accounts[0].segment,
    "cddomain": userPrincipalsResponse.accounts[0].accountCdDomainId,
    "usergroup": userPrincipalsResponse.streamerInfo.userGroup,
    "accesslevel": userPrincipalsResponse.streamerInfo.accessLevel,
    "authorized": "Y",
    "timestamp": tokenTimeStampAsMs,
    "appid": userPrincipalsResponse.streamerInfo.appId,
    "acl": userPrincipalsResponse.streamerInfo.acl
  }

  const authRequest = {
    "requests": [
      {
        "service": "ADMIN",
        "command": "LOGIN",
        "requestid": 0,
        "account": userPrincipalsResponse.accounts[0].accountId,
        "source": userPrincipalsResponse.streamerInfo.appId,
        "parameters": {
          "credential": jsonToQueryString(credentials),
          "token": userPrincipalsResponse.streamerInfo.token,
          "version": "1.0"
        }
      }
    ]
  }

  let mySock = new W3CWebSocket("wss://" + userPrincipalsResponse.streamerInfo.streamerSocketUrl + "/ws");
  mySock.onopen = function() { 
    mySock.send(JSON.stringify(authRequest));
    onOpen();
  }
  mySock.onmessage = function(evt) { 
    onMessage(evt);
  };
  mySock.onclose = function() { 
    // Ameritrade only allows one connection at a time and we need one always active
    // so create another instance in case current one closes for any reason
    mySock.send(JSON.stringify(logoutRequest));
    onClose();

    // Reassign websocket variable in dashboard to this new websocket through recursive call
    setTimeout(() => {createWebsocket(refObj, {onOpen, onMessage, onClose, onError})}, 5000);
  };

  refObj.websocket = mySock;
}

export const stockSubRequest = (symbols: string, fields: string) => {
  return {"requests": [
    {
      "service": "QUOTE",
      "command": "SUBS",
      "requestid": 1,
      "account": userPrincipalsResponse.accounts[0].accountId,
      "source": userPrincipalsResponse.streamerInfo.appId,
      "parameters": {
          "keys": symbols,
          /* 
          Refer to https://developer.tdameritrade.com/content/streaming-data#_Toc504640598
          for meaning of '#' fields
          */
          "fields": fields
      }
    }
  ]}
};

export const logoutRequest = () => {
  return {"requests": [
    {
      "service": "ADMIN",
      "requestid": "1",
      "command": "LOGOUT",
      "account": userPrincipalsResponse.accounts[0].accountId,
      "source": userPrincipalsResponse.streamerInfo.appId,
      "parameters": { }
    }
  ]}
}

export const Ameritrade = {createWebsocket, stockSubRequest};
export default Ameritrade;