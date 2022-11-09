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
import Watchlist from '../components/watchlist/watchlist_main'
import TransactionQuantities from '../components/dashboard/transaction-quantity.js'


export default function Dashboard() {
  const user = useContext(AuthContext);
  const websocketCtx = useContext(TD_WebsocketContext);

  const router = useRouter();

  const [stockData, setStockData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [dashboardComponent, setDashboardComponent] = useState('positions');
  const [isLoading, setIsLoading] = useState(false);

  const setterProps = {
    setStockData,
    setDashboardComponent,
    setIsLoading,
    setHasSearched
  }
  
  ///// Handle conditional rendering for the three different dashboard components /////
  const ENUM_COMPONENTS = {
    quote: (hasSearched && stockData) ? <> <StockSearch stockData={stockData} /> </> : <> No stock quote to show </>,
    watch: <Watchlist setDashboardComponent={setDashboardComponent} {...setterProps} />,
    positions: <Positions websocket={websocketCtx.websocket} {...setterProps} />
  }

  function EnumState({state}) {
    return <> {ENUM_COMPONENTS[state]} </>
  }
  ///// /////

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
      <div className={styles.main}> 
        <Balance username={user.name} />
        <NavMenu setDashboardComponent={setDashboardComponent} />
        <StockSearchForm websocket={websocketCtx.websocket} {...setterProps} />
        <TransactionQuantities />
        <div className={[dashboardStyles.conditionalRenderSection, styles.centered].join(' ')}>
          {/* Components that conditionally render */}
          {isLoading ? <Loading /> : 
          <EnumState state={dashboardComponent} />}
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

function NavMenu({setDashboardComponent}) {
  return (
    <nav>
      <ShowLastSearchButton setDashboardComponent={setDashboardComponent} />
      <ShowHoldingsButton setDashboardComponent={setDashboardComponent} />
      <WatchListButton setDashboardComponent={setDashboardComponent} />
    </nav>
  );
}

function ShowLastSearchButton({setDashboardComponent}) {
  function onClick() {
    setDashboardComponent('quote');
  }

  return (
    <ActionButton onClick={onClick} buttonText='Show Last Search' />
  );
}

function ShowHoldingsButton({setDashboardComponent}) {

  function onClick() {
    setDashboardComponent('positions');
  }

  return (
    <ActionButton onClick={onClick} buttonText='Show Holdings' />
  );
}

function WatchListButton({setDashboardComponent}) {
  function onClick() {
    setDashboardComponent('watch');
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