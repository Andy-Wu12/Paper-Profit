import { useEffect, useState } from 'react';

import gridStyles from '../../styles/PositionGrid.module.css';
import quoteStyles from '../../styles/StockDetail.module.css';

import { StockSymbolButton } from '../dashboard/positions';
import Ameritrade from '../generic/ameritrade-websocket';

export default function WatchList({websocket, watchListData, ...setterProps}) {  
  const [realtimeData, setRealtimeData] = useState(null);

  const subscriptionFields = "0,1,2,3,8,30,31";

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
  const watchListHTML = [];
  
  const fieldToLabelMap = {
    1: 'Bid',
    2: 'Ask',
    3: 'Last',
    8: 'Volume',
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
    const bid = data['1'];
    const ask = data['2'];
    const mark = (bid + ask) / 2;

    const symbolHTML = (
      <tr key={`${symbol}-watchlist-row`} className={gridStyles.gridRow}>
        <td> <StockSymbolButton {...setterProps} websocket={websocket} symbol={symbol} />  </td>
        {/* TODO: Color should change depending on previous price (red down, green up)  */}
        <td> {mark.toFixed(2)} </td>
        {Object.keys(fieldToLabelMap).map((key) => {
          const fieldName = fieldToLabelMap[key];
          return (
            <td key={`${symbol}-${fieldName}`}>
              {/* Don't show decimal points for volume */}
              {(fieldName === 'Volume') ? data[key] : data[key].toFixed(2) || '-'} 
            </td>
          )
        })}
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