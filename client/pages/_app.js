import '../styles/globals.css'

import { useContext, useEffect, useState } from 'react'
import { AuthContext, getUserDetails } from '../components/authContext'

function MyApp({ Component, pageProps }) {
  const userContext = useContext(AuthContext);

  const [currentUser, setCurrentUser] = useState(userContext);

  useEffect(() => {
    const getUser = async () => {
      const data = await getUserDetails();
      if(data.ok) {
        setCurrentUser(data.username);
      }
      
    }

    getUser();
    
  }, [])

  return (
    <AuthContext.Provider value={currentUser}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  )
}

export default MyApp
