import '../styles/globals.css'

import { useContext, useEffect, useState } from 'react'
import Footer from '../components/footer';

import { AuthContext, getUserDetails } from '../components/authentication/authContext'
import TD_WebsocketContext from '../components/generic/td-websocketContext';
import Ameritrade from '../components/generic/ameritrade-websocket';

import LogoutForm from '../components/authentication/logout-button';

function MyApp({ Component, pageProps }) {
  const userContext = useContext(AuthContext);
  const wsContext = useContext(TD_WebsocketContext);

  const [currentUser, setCurrentUser] = useState(userContext);
  const [websocket, setWebsocket] = useState(wsContext);

  useEffect(() => {
    const getUser = async () => {
      const data = await getUserDetails();
      if(data.ok) {
        const response = await data.json();
        setCurrentUser({ name: response.username });
      }
      else {
        setCurrentUser({ name: '' });
      }
    }

    getUser();
    
  }, [])

  useEffect(() => {
    const getTDWebsocket = async () => {
      const websocketObj = {};
      Ameritrade.createWebsocket(websocketObj);
      setWebsocket({ websocket: websocketObj.websocket })
    }

    getTDWebsocket();

  }, [])

  return (
    <>
      <AuthContext.Provider value={currentUser}>
        <TD_WebsocketContext.Provider value={websocket}>
          <Component {...pageProps} /> <br/>
          <LogoutForm />
        </TD_WebsocketContext.Provider>
      </AuthContext.Provider>
      <Footer />
    </>
  )
}

export default MyApp
