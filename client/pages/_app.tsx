import '../styles/globals.css'

import { useContext, useEffect, useState } from 'react'

// Type interfaces
import { AuthContextProps } from '../components/authentication/authContext';
import { WebsocketProps } from '../components/generic/td-websocketContext';

// Components
import Footer from '../components/footer';
import Loading from '../components/generic/loading';
import { AuthContext, getUserDetails } from '../components/authentication/authContext'
import TD_WebsocketContext from '../components/generic/td-websocketContext';
import Ameritrade from '../components/generic/ameritrade-websocket';
import LogoutForm from '../components/authentication/logout-button';

function MyApp({ Component, pageProps }): React.ReactElement {
  const userContext: AuthContextProps = useContext(AuthContext);

  const [currentUser, setCurrentUser] = useState<AuthContextProps>(userContext);
  const [websocketCtx, setWebsocketCtx] = useState<WebsocketProps>(null);

  useEffect(() => {
    const getUser: () => void = async () => {
      const data = await getUserDetails();
      if(data.ok) {
        const response = await data.json();
        setCurrentUser({ name: response.message.username });
      }
      else {
        setCurrentUser({ name: '' });
      }
    }

    getUser();
    
  }, [])

  useEffect(() => {
    const getTDWebsocket: () => void = async () => {
      const websocketObj = {websocket: null};
      Ameritrade.createWebsocket(websocketObj);
      setWebsocketCtx(websocketObj)
    }

    getTDWebsocket();

  }, [])

  if(websocketCtx && websocketCtx.websocket) {
    return (
      <>
        <AuthContext.Provider value={currentUser}>
          <TD_WebsocketContext.Provider value={websocketCtx}>
            <Component {...pageProps} /> <br/>
            <LogoutForm />
          </TD_WebsocketContext.Provider>
        </AuthContext.Provider>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Loading />
    </>
  )
}

export default MyApp
