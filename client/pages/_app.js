import '../styles/globals.css'

import { useContext, useEffect, useState } from 'react'
import { AuthContext, getUserDetails } from '../components/authContext'

import Footer from '../components/footer';
import LogoutForm from '../components/logout-button';

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
        <Component {...pageProps} />
        <LogoutForm />
      </AuthContext.Provider>
      <Footer />
    </>
  )
}

export default MyApp
