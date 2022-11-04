import { useEffect, useState } from 'react';

import gridStyles from '../../styles/PositionGrid.module.css';
import quoteStyles from '../../styles/StockDetail.module.css';

import Ameritrade from '../generic/ameritrade-websocket';

export default function WatchList({websocket, watchListData}) {  
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

  const watchListHTML = [];
  
  if(realtimeData) { 
    for(const [,symbolData] of Object.entries(realtimeData)) {
      console.log(symbolData);
      const symbolHTML = (
        <tr key={`${symbolData.key}-watchlist-row`} className={gridStyles.gridRow}>
          <td> {symbolData.key} </td>
          {/* TODO: Color should change depending on previous price (red down, green up)  */}
          <td className={quoteStyles.askPrice}> {symbolData['1']} </td>
        </tr>
      )
      watchListHTML.push(symbolHTML);
    }
  }
    

  return (
    <table>
      <tbody>
        {watchListHTML}
      </tbody>
    </table>
  )
}
