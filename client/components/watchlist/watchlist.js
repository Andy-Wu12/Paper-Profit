import { useEffect, useState } from 'react';

import gridStyles from '../../styles/PositionGrid.module.css';
import quoteStyles from '../../styles/StockDetail.module.css';

import { StockSymbolButton } from '../dashboard/positions';
import Ameritrade from '../generic/ameritrade-websocket';

export default function WatchList({websocket, watchListData, ...setterProps}) {  
  const [realtimeData, setRealtimeData] = useState(null);

  const subscriptionFields = "0,1";

  useEffect(() => {
    websocket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if(data.data) {
        const newData = data.data[0].content;
        setRealtimeData(oldData => {return {...oldData, ...newData} });
      }
    }
  }, [])

  useEffect(() => {
    const symbols = watchListData.join(',');
    websocket.send(JSON.stringify(Ameritrade.stockSubRequest(symbols, subscriptionFields)));
  }, [watchListData])

  // Process realtime data
  if(realtimeData) {
    const symbolData = [];
    for(const [,symbolObj] of Object.entries(realtimeData)) {
      symbolData.push(symbolObj);
    }

    return (
      <>
        <WatchlistGrid {...setterProps} websocket={websocket} realtimeData={symbolData} />
      </>
    )
  }

  return (
    <>
      {watchListData ? <h1> Loading data... </h1> : <h1> Your watchlist is empty </h1>}
    </>
  )
}

export function WatchlistGrid({websocket, realtimeData, ...setterProps}) {
  const watchListHTML = [];
  
  realtimeData.map((symbolData) => {
    const symbolHTML = (
      <tr key={`${symbolData.key}-watchlist-row`} className={gridStyles.gridRow}>
        <td> <StockSymbolButton {...setterProps} websocket={websocket} symbol={symbolData.key} />  </td>
        {/* TODO: Color should change depending on previous price (red down, green up)  */}
        <td className={quoteStyles.askPrice}> {symbolData['1']} </td>
      </tr>
    );
    // console.log(symbolHTML);
    watchListHTML.push(symbolHTML);
  })

  return (
    <table>
      <tbody>
        <tr className={gridStyles.gridRow}>
          <th> Position </th>
          <th> Trade Price </th>
        </tr>
        {watchListHTML}
      </tbody>
    </table>
  )
}