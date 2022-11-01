import Head from 'next/head'
import {useRouter} from 'next/router'
import { useState, useContext, useEffect } from 'react'

import styles from '../styles/Home.module.css'
import dashboardStyles from '../styles/dashboard.module.css'

import AuthContext from '../components/authentication/authContext.js'
import StockSearchForm from '../components/dashboard/stock-search.js'
import StockDetails from '../components/dashboard/stock-details.js'
import Positions from '../components/dashboard/positions.js'
import ActionButton from '../components/generic/action-button'
import Loading from '../components/generic/loading'
import Ameritrade from '../components/generic/ameritrade-websocket'
import WatchList from '../components/dashboard/watchlist'

const websocketObj = {};
Ameritrade.createWebsocket(websocketObj);

export default function Dashboard() {
  const user = useContext(AuthContext);
  const router = useRouter();

  const [stockData, setStockData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showHoldings, setShowHoldings] = useState(true);
  const [watchList, setWatchlist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const setterProps = {
    setStockData,
    setShowHoldings,
    setIsLoading,
    setHasSearched
  }

  useEffect(() => {
    if(!localStorage.getItem('user')) { 
      router.push('/');
    }

    const getWatchlist = async () => {
      if(user.name) {
        const watchlistAPI_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/watchlist/user/${user.name}`;
        const response = await fetch(watchlistAPI_URL);
        const data = await response.json();
        setWatchlist(data);
      }
    }

    getWatchlist();

  }, [user.name, stockData])

  return (
    <div className={styles.container}>
      <Head>
        <title>{`${user.name}'s Dashboard`}</title>
        <meta name="description" content="Stock Trading Simulator Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className={styles.title}> Dashboard </h1>
      {/* Components that should always render */}
      <Balance username={user.name} />
      <NavStateTriggers setShowHoldings={setShowHoldings} />
      <StockSearchForm websocket={websocketObj.websocket} {...setterProps} />

      {/* Show watchlist and positions/quote details side-by-side */}
      <div className={dashboardStyles.splitGridContainer}>
        {watchList &&
          <div className={dashboardStyles.watchlist}>
            <h2> Watchlist </h2>
            <WatchList watchListJSON={watchList} />
          </div>
        }
        <div className={dashboardStyles.conditionalRenderSection}>
          {/* Components that conditionally render */}
          {isLoading ? <Loading /> : 
          showHoldings ? <Positions websocket={websocketObj.websocket} {...setterProps} /> : (hasSearched ? <StockSearch stockData={stockData} setStockData={setStockData} /> : <p> No stock quote to show! </p>)}
        </div>
      </div>
    </div>
  );
}

function StockSearch({stockData}) {
  return (
    <>
      {stockData && <StockDetails stockDataJSON={stockData} />}
    </>
  );
}

function NavStateTriggers({setShowHoldings}) {
  return (
    <nav>
      <ShowLastSearchButton holdingsTrigger={setShowHoldings} />
      <ShowHoldingsButton holdingsTrigger={setShowHoldings} />
    </nav>
  );
}

function ShowLastSearchButton({holdingsTrigger}) {
  function onClick() {
    holdingsTrigger(false);
  }

  return (
    <ActionButton onClick={onClick} buttonText='Show Last Search' />
  );
}

function ShowHoldingsButton({holdingsTrigger}) {

  function onClick() {
    holdingsTrigger(true);
  }

  return (
    <ActionButton onClick={onClick} buttonText='Show Holdings' />
  );
}

function Balance({username}) {
  const [balance, setBalance] = useState(null);
  const [websocket, setWebsocket] = useState(null);

  useEffect(() => {
    try {
      if(!websocket && username) {
        const ws = new WebSocket("ws://localhost:3011/balance");
        ws.addEventListener('open', () => { ws.send(JSON.stringify({username: username, action: 'sub'})); });
        ws.addEventListener('message', (event) => {
          setBalance(event.data);
          // ws.send(username);
        })
        setWebsocket(ws);
      }
    } catch (e) {
      setWebsocket(null);
    }
  });

  return (
    <>
      {balance && <h2> Your Remaining Cash: {parseFloat(balance).toFixed(2)} </h2>}
    </>
  )
}