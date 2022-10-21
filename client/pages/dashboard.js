import Head from 'next/head'

import { useState, useContext, useEffect } from 'react'

import styles from '../styles/Home.module.css'

import AuthContext from '../components/authentication/authContext.js'
import StockSearchForm from '../components/dashboard/stock-search.js'
import StockDetails from '../components/dashboard/stock-details.js'
import HoldingDetails from '../components/dashboard/holdings.js'
import ActionButton from '../components/generic/action-button'

export default function Dashboard() {
  const user = useContext(AuthContext);
  
  const [stockData, setStockData] = useState(null);
  const [showHoldings, setShowHoldings] = useState(true);

  return (
    <div className={styles.container}>
      <Head>
        <title>{`${user.name}'s Dashboard`}</title>
        <meta name="description" content="Stock Trading Simulator Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className={styles.title}> Dashboard </h1>
      {/* Components that should always render */}
      <NavStateTriggers setStockData={setStockData} setShowHoldings={setShowHoldings} />
      <StockSearchForm setStockData={setStockData} setShowHoldings={setShowHoldings} />

      {/* Components that conditionally render */}
      {showHoldings ? <Holdings /> : 
      <StockSearch stockData={stockData} setStockData={setStockData} /> }

    </div>
  );
}

function StockSearch({stockData, setStockData}) {
  return (
    <>
      {stockData && <StockDetails stockDataJSON={stockData} />}
    </>
  );
}

function Holdings() {
  return (
    <>
      <h2> Holdings </h2>
      <HoldingDetails />
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