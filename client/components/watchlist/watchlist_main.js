import Head from 'next/head'
import {useRouter} from 'next/router'
import { useState, useContext, useEffect } from 'react'

import styles from '../../styles/Home.module.css'

import AuthContext from '../authentication/authContext.js'
import Loading from '../generic/loading'

import WatchList from './watchlist'
import TD_WebsocketContext from '../generic/td-websocketContext'


export default function Watchlist({...setterProps}) {
  const user = useContext(AuthContext);
  const wsCTX = useContext(TD_WebsocketContext);

  const router = useRouter();
  const [watchList, setWatchlist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if(!user.name) {
      router.push('/');
      return;
    }

    const getWatchlist = async () => {
      if(user.name) {
        setIsLoading(true);
        const watchlistAPI_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/watchlist/user/${user.name}`;
        const response = await fetch(watchlistAPI_URL);
        if(response.ok) {
          const data = await response.json();
          console.log(data);
          setWatchlist(data);
        }
        else {
          setWatchlist(null);
        }
        setIsLoading(false);
      }
    }

    getWatchlist();

  }, [user.name])

  return (
    <div className={styles.container}>
      <Head>
        <meta name="description" content="Stock Trading Simulator Watchlist" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!isLoading ? 
        (watchList ? 
          <WatchList {...setterProps} websocket={wsCTX.websocket} watchListData={watchList} />
          : <h1> Your watchlist is empty </h1> ) 
        : <Loading />}
    </div>
  );
}