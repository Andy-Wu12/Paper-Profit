import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../../styles/Home.module.css'

// Ameritrade websocket stuff
import Ameritrade from '../generic/ameritrade-websocket'

export default function StockSearchForm({websocket, setStockData, setShowHoldings, setIsLoading}) {  
  const router = useRouter();

  useEffect(() => {
    try {
      if(websocket) {
        websocket.onmessage = (message) => {
          const data = JSON.parse(message.data);
          if(data.data) {
            const newData = data.data[0].content[0];
            setStockData(oldData => {return {...oldData, ...newData} });
          }
        }
      };
    } catch (e) {
      console.log(e.message);
    }
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    const tickerSymbol = e.target.ticker.value;
    if(!tickerSymbol) {
      // Another option is to setStockData(null) to show error in StockDetail component, 
      // but this may be against good UX
      setIsLoading(false);
      return;
    }
    websocket.send(JSON.stringify(Ameritrade.stockSubRequest(tickerSymbol, "0,1,2,3,8,12,13,15,30,31,32,33")));

    router.push(`/dashboard/?symbol=${tickerSymbol.toUpperCase()}`);
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/stock-info/${tickerSymbol}`);
    // const stockData = await response.json();
    // setStockData(stockData);
    setShowHoldings(false);
    setIsLoading(false);
  }

  return (
    <>
      <form className={styles.card} method='GET' onSubmit={handleSubmit}>
        <label htmlFor='ticker'> Search Ticker Symbol </label><br/>
        <input type='text' placeholder='AAPL' name='ticker-symbol' id='ticker' />
        <button type='submit'> Search </button>
      </form>
    </>
  )
}
