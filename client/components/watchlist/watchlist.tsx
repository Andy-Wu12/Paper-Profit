import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { setterPropsProps } from '../../pages/dashboard';

import gridStyles from '../../styles/PositionGrid.module.css';
import quoteStyles from '../../styles/StockDetail.module.css';
import AuthContext, { AuthContextProps } from '../authentication/authContext';

import { StockSymbolButton } from '../dashboard/positions';
import ActionButton from '../generic/action-button';
import Ameritrade from '../generic/ameritrade-websocket';

export type WatchlistProps = {
  websocket: WebSocket,
  watchListData: any,
  setterProps: setterPropsProps
}

export default function WatchList({websocket, watchListData, setterProps}: WatchlistProps): React.ReactElement {  
  const [realtimeData, setRealtimeData] = useState(null);

  const subscriptionFields = "0,1,2,3,8,28,29,30,31";

  useEffect(() => {
    websocket.onmessage = (message: any) => {
      const data = JSON.parse(message.data);
      if(data.data) {
        const newData = data.data[0].content;
        setRealtimeData((oldData: any) => {
          const rtData = {};
          // Re-map realtimeJSON data to more easily accessible format when templating
          for(const [, data] of Object.entries(newData) as [never, any]) {
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
    const symbols: string = watchListData.join(',');
    websocket.send(JSON.stringify(Ameritrade.stockSubRequest(symbols, subscriptionFields)));
  }, [watchListData])

  // Process realtime data
  if(realtimeData) {
    return (
      <>
        <WatchlistGrid setterProps={setterProps} websocket={websocket} realtimeData={realtimeData} />
      </>
    )
  }

  return (
    <>
      {watchListData && <h1> Loading data... </h1>}
    </>
  )
}

type WatchlistGridProps = {
  websocket: WebSocket,
  realtimeData: any,
  setterProps: setterPropsProps
}

export function WatchlistGrid({websocket, realtimeData, setterProps}: WatchlistGridProps): React.ReactElement {
  const user: AuthContextProps = useContext(AuthContext);
  const router = useRouter();

  const watchListHTML: JSX.Element[] = [];
  
  const fieldToLabelMap = {
    1: 'Bid',
    2: 'Ask',
    3: 'Last',
    8: 'Volume',
    28: 'Open',
    30: '52 High',
    31: '52 Low',
  }

  const tableHeaders:JSX.Element[] = [];

  // Map headers
  for(const [,label] of Object.entries(fieldToLabelMap)) {
    tableHeaders.push(<th key={`${label}-label`}> {label} </th>);
  }

  // Map all fields for each symbol
  for(const [symbol, data] of Object.entries(realtimeData)) {
    const netChange = data['29'];
    const bid: number = data['1'];
    const ask: number = data['2'];
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
        <td> <StockSymbolButton setterProps={setterProps} websocket={websocket} symbol={symbol} />  </td>
        {/* Color should change depending on previous close price (red down, green up, white same)  */}
        {!netChange && <td> - </td>}
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