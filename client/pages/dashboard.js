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
import TD_WebsocketContext from '../components/generic/td-websocketContext'


export default function Dashboard() {
  const user = useContext(AuthContext);
  const websocketCtx = useContext(TD_WebsocketContext);

  const router = useRouter();

  const [stockData, setStockData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showHoldings, setShowHoldings] = useState(true);
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

  }, [user.name])

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
      <NavMenu setShowHoldings={setShowHoldings} />
      <StockSearchForm websocket={websocketCtx.websocket} {...setterProps} />

      {/* Show watchlist and positions/quote details side-by-side */}
      <div className={dashboardStyles.splitGridContainer}>
        <div className={dashboardStyles.conditionalRenderSection}>
          {/* Components that conditionally render */}
          {isLoading ? <Loading /> : 
          showHoldings ? <Positions websocket={websocketCtx.websocket} {...setterProps} /> : (hasSearched ? <StockSearch stockData={stockData} setStockData={setStockData} /> : <p> No stock quote to show! </p>)}
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

function NavMenu({setShowHoldings}) {
  return (
    <nav>
      <ShowLastSearchButton holdingsTrigger={setShowHoldings} />
      <ShowHoldingsButton holdingsTrigger={setShowHoldings} />
      <WatchListButton />
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

function WatchListButton() {
  const router = useRouter();

  const onClick = () => {
    router.push('/watchlist');
  }

  return (
    <ActionButton onClick={onClick} buttonText='See Watchlist' />
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