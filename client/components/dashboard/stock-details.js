import { useRouter } from 'next/router';

import styles from '../../styles/Home.module.css'

import stockDetailStyles from '../../styles/StockDetail.module.css'
import { BuyForm, SellForm } from './transaction-form';

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
      <StockHeading stockData={stockData} />
      <StockDescriptionList stockData={stockData} />
    </>
  )
}

export function StockHeading({stockData}) {
  const router = useRouter();

  const params = router.query;

  return (
    <>
      <h2> {stockData.longName + ' '} </h2>
      <span className={stockDetailStyles.prices}>
        <span className={stockDetailStyles.askPrice}> {stockData.ask} </span>
        <BuyForm stockSymbol={params.symbol} symbolData={stockData} /> <br/><br/>
        <span className={stockDetailStyles.bidPrice}> {stockData.bid} </span>
        <SellForm stockSymbol={params.symbol} symbolData={stockData} /> 
      </span>
    </>
  )
}

export function StockDescriptionList({stockData}) {
  const fieldToLabel = {
    'volume': 'Volume',
    'fiftyTwoWeekHigh': '52-wk High',
    'fiftyTwoWeekLow': '52-wk Low',
    'lastDividendValue': 'Dividend'
  };

  const fields = Object.keys(fieldToLabel).map((field) => {
    return (
      <div key={field} className={stockDetailStyles.descField}>
        <dt className={stockDetailStyles.label}> {fieldToLabel[field]} </dt>
        <dd className={stockDetailStyles.value}> {stockData[field]} </dd>
      </div>
    )
  });

  return (
    <dl className={stockDetailStyles.descList}>
      {fields}
    </dl>
  )
}