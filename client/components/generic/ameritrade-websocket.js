import userPrincipals from '../../pages/api/userprincipal.json'

// Utility
function jsonToQueryString(json) {
  return Object.keys(json).map(function(key) {
    return encodeURIComponent(key) + '=' +
        encodeURIComponent(json[key]);
  }).join('&');
}

const userPrincipalsResponse = userPrincipals

export function createWebsocket({ onOpen=()=> {}, onMessage=()=> {}, onClose=()=> {}, onError=()=> {}} = {}) {
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

  const mySock = new WebSocket("wss://" + userPrincipalsResponse.streamerInfo.streamerSocketUrl + "/ws");
  mySock.onopen = function() { 
    mySock.send(JSON.stringify(authRequest));
    onOpen();
  }
  mySock.onmessage = function(evt) { 
    onMessage(evt);
  }; 
  mySock.onclose = function() { 
    console.log("CLOSED"); 
    onClose();
  };

  return mySock;
}

export const stockSubRequest = (symbols, fields) => {
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

export const Ameritrade = {createWebsocket, stockSubRequest};
export default Ameritrade;