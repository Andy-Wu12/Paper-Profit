import '../styles/globals.css'

import { useContext, useEffect, useState } from 'react'
import Footer from '../components/footer';

import { AuthContext, getUserDetails } from '../components/authentication/authContext'
import LogoutForm from '../components/authentication/logout-button';


function MyApp({ Component, pageProps }) {
  const userContext = useContext(AuthContext);

  const [currentUser, setCurrentUser] = useState(userContext);

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

  return (
    <>
      <AuthContext.Provider value={currentUser}>
        <Component {...pageProps} /> <br/>
        <LogoutForm />
      </AuthContext.Provider>
      <Footer />
    </>
  )
}

export default MyApp
