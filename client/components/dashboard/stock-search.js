import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../../styles/Home.module.css'

// Ameritrade websocket stuff
import Ameritrade from '../generic/ameritrade-websocket'

export const subscriptionFields = "0,1,2,3,8,12,13,15,30,31,32,33";

export default function StockSearchForm({websocket, ...setterProps}) {  
  const router = useRouter();

  useEffect(() => {
    try {
      if(websocket) {
        websocket.onmessage = (message) => {
          const data = JSON.parse(message.data);
          if(data.data) {
            const newData = data.data[0].content[0];
            setterProps.setStockData(oldData => {return {...oldData, ...newData} });
          }
        }
      };
    } catch (e) {
      console.log(e.message);
    }
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setterProps.setIsLoading(true);
    const tickerSymbol = e.target.ticker.value;
    if(!tickerSymbol) {
      // Another option is to setStockData(null) to show error in StockDetail component, 
      // but this may be against good UX
      setterProps.setIsLoading(false);
      return;
    }
    // Set stockData(null) on new search
    setterProps.setStockData(null);
    websocket.send(JSON.stringify(Ameritrade.stockSubRequest(tickerSymbol, subscriptionFields)));

    router.push(`/dashboard/?symbol=${tickerSymbol.toUpperCase()}`);
    setterProps.setDashboardComponent('quote');
    setterProps.setLastSearch(tickerSymbol);
    setterProps.setIsLoading(false);
    setterProps.setHasSearched(true);
  }

  return (
    <>
      <form className={styles.centered} method='GET' onSubmit={handleSubmit}>
        <label htmlFor='ticker'> Search Ticker Symbol </label> <br/>
        <input type='text' placeholder='AAPL' name='ticker-symbol' id='ticker' />
        <button type='submit'> Search </button>
      </form>
    </>
  )
}
