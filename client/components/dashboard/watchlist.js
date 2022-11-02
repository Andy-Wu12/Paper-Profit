import gridStyles from '../../styles/PositionGrid.module.css';

export default function WatchList({watchListData, realtimeData}) {  

  const watchListHTML = watchListData.map((data) => 
    {
      return (
        <tr key={`${data}-watchlist-row`} className={gridStyles.gridRow}>
          <td> {data} </td>
          <td> Price of stock </td>
        </tr>
      )
    })

  return (
    <table>
      <tbody>
        {watchListHTML}
      </tbody>
    </table>
  )
}
