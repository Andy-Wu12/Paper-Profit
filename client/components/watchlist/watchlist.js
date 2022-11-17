import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';

import gridStyles from '../../styles/PositionGrid.module.css';
import quoteStyles from '../../styles/StockDetail.module.css';
import AuthContext from '../authentication/authContext';

import { StockSymbolButton } from '../dashboard/positions';
import ActionButton from '../generic/action-button';
import Ameritrade from '../generic/ameritrade-websocket';

export default function WatchList({websocket, watchListData, ...setterProps}) {  
  const [realtimeData, setRealtimeData] = useState(null);

  const subscriptionFields = "0,1,2,3,8,28,29,30,31";

  useEffect(() => {
    websocket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if(data.data) {
        const newData = data.data[0].content;
        setRealtimeData(oldData => {
          const rtData = {};
          // Re-map realtimeJSON data to more easily accessible format when templating
          for(const [, data] of Object.entries(newData)) {
            const symbol = data.key;
            if(oldData) { rtData[symbol] = {...oldData[symbol], ...data}; }
            else { rtData[symbol] = data; }
          }
          return {...oldData, ...rtData};
        });
      }
    }
  }, [])

  useEffect(() => {
    const symbols = watchListData.join(',');
    websocket.send(JSON.stringify(Ameritrade.stockSubRequest(symbols, subscriptionFields)));
  }, [watchListData])

  // Process realtime data
  if(realtimeData) {
    return (
      <>
        <WatchlistGrid {...setterProps} websocket={websocket} realtimeData={realtimeData} />
      </>
    )
  }

  return (
    <>
      {watchListData && <h1> Loading data... </h1>}
    </>
  )
}

export function WatchlistGrid({websocket, realtimeData, ...setterProps}) {
  const user = useContext(AuthContext);
  const router = useRouter();

  const watchListHTML = [];
  
  const fieldToLabelMap = {
    1: 'Bid',
    2: 'Ask',
    3: 'Last',
    8: 'Volume',
    28: 'Open',
    30: '52 High',
    31: '52 Low',
  }

  const tableHeaders = [];

  // Map headers
  for(const [,label] of Object.entries(fieldToLabelMap)) {
    tableHeaders.push(<th key={`${label}-label`}> {label} </th>);
  }

  // Map all fields for each symbol
  for(const [symbol, data] of Object.entries(realtimeData)) {
    const netChange = data['29'];
    const bid = data['1'];
    const ask = data['2'];
    const mark = (bid + ask) / 2;

    const unwatch = async () => {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/watchlist/unwatch?symbol=${symbol}`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "username": user.name,
        })
      });

      router.reload();
    }

    const symbolHTML = (
      <tr key={`${symbol}-watchlist-row`} className={gridStyles.gridRow}>
        <td> <StockSymbolButton {...setterProps} websocket={websocket} symbol={symbol} />  </td>
        {/* Color should change depending on previous close price (red down, green up, white same)  */}
        {netChange === 0 && <td> {mark.toFixed(2)} </td>}
        {netChange < 0 && <td className={gridStyles.rtPriceLower}> {mark.toFixed(2)} </td> }
        {netChange > 0 && <td className={gridStyles.rtPriceHigher}> {mark.toFixed(2)} </td> }
        {Object.keys(fieldToLabelMap).map((key) => {
          const fieldName = fieldToLabelMap[key];
          return (
            <td key={`${symbol}-${fieldName}`}>
              {/* Don't show decimal points for volume */}
              {(fieldName === 'Volume') ? data[key] : data[key].toFixed(2) || '-'} 
            </td>
          )
        })}
        {/* Button to remove from watchlist */}
        <td> <ActionButton onClick={unwatch} buttonText='Remove' /> </td> 
      </tr>
    );
    watchListHTML.push(symbolHTML);
  }

  return (
    <table>
      <tbody>
        <tr className={gridStyles.gridRow}>
          <th> Position </th>
          <th> Mark </th>
          {tableHeaders}
        </tr>
        {watchListHTML}
      </tbody>
    </table>
  )
}