import Head from 'next/head'
import {useRouter} from 'next/router'
import React, { useState, useContext, useEffect} from 'react'

import styles from '../styles/Home.module.css'
import dashboardStyles from '../styles/dashboard.module.css'

import AuthContext from '../components/authentication/authContext'

import StockSearchForm from '../components/dashboard/stock-search'
import StockDetails from '../components/dashboard/stock-details'
import Balance from '../components/dashboard/balance'
import Positions from '../components/dashboard/positions'
import TransactionQuantities from '../components/dashboard/transaction-quantity'
import StockCharts from '../components/dashboard/charts/stockCharts'

import NavMenu from '../components/generic/navMenu'
import Loading from '../components/generic/loading'
import TD_WebsocketContext from '../components/generic/td-websocketContext'
import Watchlist from '../components/watchlist/watchlist_main'

// Types
import type { AuthContextProps } from '../components/authentication/authContext'
import type { WebsocketProps } from '../components/generic/td-websocketContext'

export type setterPropsProps = {
  setStockData: React.Dispatch<any>,
  setDashboardComponent: React.Dispatch<any>,
  setIsLoading: React.Dispatch<any>,
  setHasSearched: React.Dispatch<any>,
  setLastSearch: React.Dispatch<any>
}

export default function Dashboard(): React.ReactElement {
  const user: AuthContextProps = useContext(AuthContext);
  const websocketCtx: WebsocketProps = useContext(TD_WebsocketContext);

  const router = useRouter();

  const [stockData, setStockData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearch, setLastSearch] = useState(null);
  const [dashboardComponent, setDashboardComponent] = useState('positions');
  const [isLoading, setIsLoading] = useState(false);

  const setterProps: setterPropsProps = {
    setStockData: setStockData,
    setDashboardComponent: setDashboardComponent,
    setIsLoading: setIsLoading,
    setHasSearched: setHasSearched,
    setLastSearch: setLastSearch
  }
  
  ///// Handle conditional rendering for the three different dashboard components /////
  const ENUM_COMPONENTS = {
    quote: (hasSearched && stockData) ? <> <StockSearch stockData={stockData} /> </> : <> No stock quote to show </>,
    watch: <Watchlist setterProps={setterProps} />,
    positions: <Positions websocket={websocketCtx.websocket} setterProps={setterProps} />
  }

  function EnumState({state}: {state: string}) {
    return <> {ENUM_COMPONENTS[state]} </>
  }
  ///// /////

  useEffect(() => {
    if(!localStorage.getItem('user') || !user.name) { 
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
        <NavMenu setterProps={setterProps} setDashboardComponent={setDashboardComponent} lastSearch={lastSearch} websocket={websocketCtx.websocket} />
        <StockSearchForm setterProps={setterProps} websocket={websocketCtx.websocket} />

        {dashboardComponent == 'quote' && <TransactionQuantities />}
        <div className={[dashboardStyles.conditionalRenderSection, styles.centered].join(' ')}>
         {/* Components that conditionally render */}
          {isLoading ? <Loading /> : 
          <EnumState state={dashboardComponent} />}
          {dashboardComponent == 'quote' && <StockCharts />}
        </div>
      </div>
    </div>
  );
}

function StockSearch({stockData}: {stockData: any}): React.ReactElement {
  return (
    <>
      {stockData && 
        <> 
          <StockDetails stockDataJSON={stockData} /> 
        </>
      }
    </>
  );
}

