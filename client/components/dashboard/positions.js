import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import AuthContext from '../authentication/authContext';
import Ameritrade from '../generic/ameritrade-websocket';
import ActionButton from '../generic/action-button';

import gridStyles from '../../styles/PositionGrid.module.css';

export default function Positions({websocket, setShowHoldings}) {
  const user = useContext(AuthContext);

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
            setRealtimeData(oldData => {return {...oldData, ...newData} });
          }
        }
      };

      if(!isSubbed && positionData) {
        const symbols = Object.keys(positionData).join(',');
        websocket.send(JSON.stringify(Ameritrade.stockSubRequest(symbols, "0, 2")));
        setIsSubbed(true);
      }
    } catch (e) {
      console.log(e.message);
    }
  }, [realtimeData, positionData, websocket])

  return (
    <>
      <h2> Your Positions </h2>
      {/* TODO: Find way to guarantee realtimeData is fetched and available before reaching this function (on initial render)
      so extra conditional is not needed */}
      {(positionData && realtimeData) ? <PositionGrid positionDataJSON={positionData} realtimeJSON={realtimeData} setShowHoldings={setShowHoldings} /> : <h3> No positions to show! </h3> }
    </>
  );
}

function PositionGrid({positionDataJSON, realtimeJSON, setShowHoldings}) {
  const positions = [];
  const realtimeData = {};
  const router = useRouter();

  // Re-map realtimeJSON data to more easily accessible format when templating
  for(const [, data] of Object.entries(realtimeJSON)) {
    realtimeData[data.key] = data;
  }

  for (const [symbol, data] of Object.entries(positionDataJSON)) {
    // Clicking on the stock name should redirect to stock search details
    // and modify the global TD websocket to stream corresponding data
    const onClick = () => {
      setShowHoldings(false);
    }

    const avgPrice = data.avgPrice.toFixed(2);
    const realtimePrice = realtimeData[symbol][2].toFixed(2);
    const realtimeClassName = realtimePrice < avgPrice ? gridStyles.rtPriceLower : gridStyles.rtPriceHigher;

    const gridRow = (
      <tr key={`${symbol}-grid-data`} className={gridStyles.gridRow}>
        <td> 
          <ActionButton buttonText={symbol} className='' onClick={onClick} /> 
          <span className={realtimeClassName}> {realtimePrice} </span> 
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
      <table>
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