import { useRouter } from 'next/router';
import { useContext, useState, useEffect } from 'react';

import styles from '../../styles/Home.module.css'
import stockDetailStyles from '../../styles/StockDetail.module.css'

import AuthContext from '../authentication/authContext';
import { BuyForm, SellForm } from './transaction-form';
import ActionButton from '../generic/action-button';
import CandleStickChart from '../charts/candlestick';
import SelectDropdown from '../generic/dropdown-select';

export default function StockDetails({stockDataJSON}) {  
  const isSuccess = stockDataJSON.key;

  return (
    <div className={styles.card}>
      {isSuccess ? <StockDetail stockData={stockDataJSON} /> : <h2> Invalid Ticker Symbol </h2>}
    </div>
  )
}

export function StockDetail({stockData}) {
  // Chart data format = {
    // ["Label", "", "", "", ""],
      // Label -> Low / Min -> Open -> Close -> High / Max
    // ["Mon", 20, 28, 38, 45],
    // ["Tue", 31, 38, 55, 66],
  // }

  // Options reference: https://developers.google.com/chart/interactive/docs/gallery/candlestickchart#data-format
  const options = {
    legend: "none",
    bar: { groupWidth: "75%" }, // Remove space between bars.
    candlestick: {
      fallingColor: { strokeWidth: 0, fill: "#a52714" }, // red
      risingColor: { strokeWidth: 0, fill: "#0f9d58" }, // green
    },
  };

  const periodOptions = ['5d','1d','1mo','3mo','6mo','1y','2y','5y','10y','ytd'] 

  const [period, setPeriod] = useState('5d');
  const [periodData, setPeriodData] = useState(null);

  const symbol = stockData.key

  const getPeriodData = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/stock-info/price/${period}/${symbol}`;
    const response = await fetch(url);
    const newPeriodData = await response.json();
    setPeriodData(newPeriodData);
  }

  useEffect(() => {
    getPeriodData();
  }, [period])

  let stockChartData = [["Day", "", "", "", ""]];

  if(periodData) {
    for(const data of periodData.data) {
      const date = new Date(data.Date);
      const dateLabel = `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
      stockChartData.push([dateLabel, data.Low, data.Open, data.Close, data.High]);
    }
  }

  return (
    <>
      <StockHeading stockData={stockData} />
      <StockDescriptionList stockData={stockData} />
      <CandleStickChart symbolData={stockChartData} options={options} />
      <SelectDropdown options={periodOptions} onChange={(e) => {setPeriod(e.target.value)}}/>
    </>
  )
}

export function StockHeading({stockData}) {
  /* 
  Refer to https://developer.tdameritrade.com/content/streaming-data#_Toc504640598
  for meaning of ['#'] indexed fields
  */

  const router = useRouter();

  const params = router.query;

  const labelToField = {
    'bid': '1',
    'ask': '2',
    'last': '3'
  };

  return (
    <>
      <h2> 
        {stockData.key + ' '} 
        (Last: <span className={stockDetailStyles.lastPrice}> {stockData[labelToField.last].toFixed(2)} </span>)
      </h2>
      <span className={stockDetailStyles.prices}>
        <span className={stockDetailStyles.askPrice}> {stockData[labelToField.ask].toFixed(2)} </span>
        <BuyForm stockSymbol={params.symbol} symbolData={stockData} /> <br/><br/>
        <span className={stockDetailStyles.bidPrice}> {stockData[labelToField.bid].toFixed(2)} </span>
        <SellForm stockSymbol={params.symbol} symbolData={stockData} /> 
      </span> <br/><br/>
      <WatchForm stockSymbol={stockData.key}/>
    </>
  )
}

export function StockDescriptionList({stockData}) {
  /* 
  Refer to https://developer.tdameritrade.com/content/streaming-data#_Toc504640598
  for meaning of ['#'] indexed fields
  */
  const fieldToLabel = {
    '8': 'Volume',
    '12': 'Day High',
    '13': 'Day Low',
    '15': 'Close Price',
    '30': '52-wk High',
    '31': '52-wk Low',
    '32': 'PE Ratio',
    '33': 'Dividend'
  };

  const fields = Object.keys(fieldToLabel).map((field) => {
    return (
      <div key={field} className={stockDetailStyles.descField}>
        <span className={stockDetailStyles.label}> {fieldToLabel[field]} </span> <br/>
        <span className={stockDetailStyles.value}> {stockData[field] || '-'} </span>
      </div>
    )
  });

  return (
    <div className={stockDetailStyles.descList}>
      {fields}
    </div>
  )
}

export function WatchForm({stockSymbol}) {
  const user = useContext(AuthContext);

  const watch = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/watchlist/watch?symbol=${stockSymbol}`, {
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
  }

  return (
    <>
      <ActionButton onClick={watch} buttonText='Add to Watchlist' /> &nbsp;
    </>
  )
}