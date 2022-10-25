import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../../styles/Home.module.css'

// Ameritrade websocket stuff
import userPrincipals from '../../pages/api/userprincipal.json'
import CreateWebsocket from '../generic/ameritrade-websocket'

export default function StockSearchForm({setStockData, setShowHoldings, setIsLoading}) {  
  const router = useRouter();

  const [websocket, setWebsocket] = useState(null);

  // TODO: Make API fetch if possible
  const userPrincipalsResponse = userPrincipals;
  const stockSubRequest = (symbol) => {
    return {"requests": [
      {
        "service": "QUOTE",
        "command": "SUBS",
        "requestid": 1,
        "account": userPrincipalsResponse.accounts[0].accountId,
        "source": userPrincipalsResponse.streamerInfo.appId,
        "parameters": {
            "keys": symbol,
            /* 
            Refer to https://developer.tdameritrade.com/content/streaming-data#_Toc504640598
            for meaning of '#' fields
            */
            "fields": "0,1,2,8,30,31,33"
        }
      }
    ]}
  };

  useEffect(() => {
    try {
      if(!websocket) {
        const socket = CreateWebsocket({
          onMessage: (message) => {
            const data = JSON.parse(message.data);
            if(data.data) {
              const newData = data.data[0].content[0];
              setStockData(oldData => {return {...oldData, ...newData} });
            }
          }
       });
        setWebsocket(socket);
      }
    } catch (e) {
      setWebsocket(null);
    }
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    const tickerSymbol = e.target.ticker.value;
    websocket.send(JSON.stringify(stockSubRequest(tickerSymbol)));
    if(!tickerSymbol) {
      // Another option is to setStockData(null) to show error in StockDetail component, 
      // but this may be against good UX
      return;
    }

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
