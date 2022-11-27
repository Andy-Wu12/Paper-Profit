import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import AuthContext, { AuthContextProps } from '../authentication/authContext';
import Ameritrade from '../generic/ameritrade-websocket';
import ActionButton from '../generic/action-button';
import { subscriptionFields } from './stock-search';
import StockNews from '../news/stock-news';

import { setterPropsProps } from '../../pages/dashboard';

import styles from '../../styles/Home.module.css';
import gridStyles from '../../styles/PositionGrid.module.css';

interface PositionsProps {
  websocket: WebSocket,
  setterProps: setterPropsProps
}

export default function Positions({websocket, setterProps}: PositionsProps): React.ReactElement {
  const user: AuthContextProps = useContext(AuthContext);

  const [positionData, setPositionsData] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  
  const [isSubbed, setIsSubbed] = useState(false);

  useEffect(() => {
    const getPositions = async() => {
      try {
        if(user.name) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${user.name}/holdings`);
          const data = await response.json();
          if(Object.keys(data).length === 0) { setPositionsData(null); }
          else { setPositionsData(data); }
        }
        else {
          throw new Error();
        }
      } catch (e) {
        setPositionsData(null);
      }
    };

    getPositions();
    
  }, [user.name]);

  // Handle websocket stuff
  useEffect(() => {
    try {
      if(!websocket) {
        setIsSubbed(false);
      }

      // console.log(realtimeData);
      if(websocket && positionData) {
        websocket.onmessage = (message) => {
          const data = JSON.parse(message.data);
          if(data.data) {
            const newData = data.data[0].content;
            setRealtimeData((oldData: any) => {
              const rtData = {};
              // Re-map realtimeJSON data to more easily accessible format when templating
              for(const [, data] of Object.entries(newData) as [never, any]) {
                rtData[data.key] = data;
              }
              return {...oldData, ...rtData} 
            });
          }
        }
      };

      if(!isSubbed && positionData) {
        const symbols: string = Object.keys(positionData).join(',');
        websocket.send(JSON.stringify(Ameritrade.stockSubRequest(symbols, "0, 1")));
        setIsSubbed(true);
      }
    } catch (e) {
      console.log(e.message);
    }
  }, [realtimeData, positionData, websocket])

  return (
    <>
      <h2> Your Positions </h2>
      {/* TODO: Find way to guarantee realtimeData is fetched and available 
      before reaching this function (on initial render) so extra conditional is not needed */}
      {(positionData && realtimeData) ? 
        <PositionGrid 
          setterProps={setterProps} 
          websocket={websocket} 
          positionDataJSON={positionData} 
          realtimeData={realtimeData} 
        />
        : <h3> No positions to show! </h3> 
      }
      {positionData && <> <h2> Related News </h2> <StockNews symbolList={Object.keys(positionData)} /> </>}
    </>
  );
}

interface PositionGridProps extends PositionsProps {
  positionDataJSON: any,
  realtimeData: any
}

function PositionGrid({positionDataJSON, realtimeData, websocket, setterProps}: PositionGridProps): React.ReactElement {
  const positions: JSX.Element[] = [];

  for (const [symbol, data] of Object.entries(positionDataJSON) as [string, any]) {
    const avgPrice = data.avgPrice.toFixed(2);

    const realtimeBidPrice: number = realtimeData[symbol][1].toFixed(2);
    const realtimeClassName: string = realtimeBidPrice < avgPrice ? gridStyles.rtPriceLower : gridStyles.rtPriceHigher;

    const gridRow = (
      <tr key={`${symbol}-grid-data`} className={gridStyles.gridRow}>
        <td> 
          <StockSymbolButton setterProps={setterProps} websocket={websocket} symbol={symbol} /> 
          <span className={realtimeClassName}> {realtimeBidPrice} </span> 
        </td>
        <td> {avgPrice} </td>
        <td> {data.totalPrice.toFixed(2)} </td>
        <td> {data.quantity} </td>
      </tr>
    )
    positions.push(gridRow);
  }

  return (
    <>
      <table className={styles.grid}>
        <tbody className={gridStyles.positionsTable}>
          <tr className={gridStyles.gridRow}>
            <th> Position </th>
            <th> Trade Price </th>
            <th> Cost </th>
            <th> Quantity </th>
          </tr>
          {/* Render position data */}
          {positions}
        </tbody>
      </table>
    </>
  )
}

interface StockSymbolButtonProps extends PositionsProps {
  symbol: string
}

export function StockSymbolButton({symbol, websocket, setterProps}: StockSymbolButtonProps): React.ReactElement {
  const router = useRouter();
  // Clicking on the stock name should redirect to stock search details
    // and modify the global TD websocket to stream corresponding data
  const onClick = () => {
    if(websocket) {
      websocket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if(data.data) {
          const newData = data.data[0].content[0];
          setterProps.setStockData((oldData: any) => {return {...oldData, ...newData} });
        }
      }
      // Set stockData(null) on new search
      setterProps.setStockData(null);

      websocket.send(JSON.stringify(Ameritrade.stockSubRequest(symbol, subscriptionFields)));
      setterProps.setLastSearch(symbol);
      setterProps.setHasSearched(true);
      setterProps.setDashboardComponent('quote');
    }
    router.push(`/dashboard?symbol=${symbol}`);
  }

  return (
    <ActionButton buttonText={symbol} className={gridStyles.positionSymbol} onClick={onClick} />
  )
}