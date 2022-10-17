import styles from '../../styles/Home.module.css'
import stockDetailStyles from '../../styles/StockDetail.module.css'

export default function StockDetails({stockDataJSON}) {  
  const isSuccess = stockDataJSON.status === 200;

  return (
    <div className={styles.card}>
      {isSuccess ? <StockDetail stockData={stockDataJSON.data} /> : <h2> Invalid Ticker Symbol </h2>}
    </div>
  )
}

export function StockDetail({stockData}) {
  // TODO: Add real-time data
  return (
    <>
      <h2> 
        {stockData.longName + ' '}
        <span className={stockDetailStyles.prices}>
          <span className={stockDetailStyles.askPrice}> {stockData.ask} </span> {' '}
          / {' '} 
          <span className={stockDetailStyles.bidPrice}> {stockData.bid} </span>
        </span> 
      </h2>
    </>
  )
}
