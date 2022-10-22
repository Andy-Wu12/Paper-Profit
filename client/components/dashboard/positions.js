import { useContext, useEffect, useState } from 'react';

import AuthContext from '../authentication/authContext';

export default function Positions() {
  const user = useContext(AuthContext);

  const [positionData, setPositionsData] = useState(null);
  
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

  return (
    <>
      <h2> Your Positions </h2>
      {positionData ? <PositionGrid positionDataJSON={positionData} /> : <h3> No positions to show! </h3> }
    </>
  );
}

function PositionGrid({positionDataJSON}) {
  return (
    <>
      <table>
        <tbody>
          <tr>
            <th> Position </th>
            <th> Trade Price </th>
            <th> Cost </th>
            <th> Quantity </th>
          </tr>
          {/* Render position data */}
        </tbody>
      </table>
    </>
  )
}