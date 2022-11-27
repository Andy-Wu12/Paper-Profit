import { useRouter } from 'next/router';
import { useContext, useState, useEffect } from 'react';

import styles from '../../styles/Home.module.css'
import stockDetailStyles from '../../styles/StockDetail.module.css'

import AuthContext from '../authentication/authContext';
import { BuyForm, SellForm } from './transaction-form';
import ActionButton from '../generic/action-button';

export default function StockDetails({stockDataJSON}: {stockDataJSON: any}): React.ReactElement {  
  const isSuccess = stockDataJSON.key;

  return (
    <div className={styles.card}>
      {isSuccess ? <StockDetail stockData={stockDataJSON} /> : <h2> Invalid Ticker Symbol </h2>}
    </div>
  )
}

export function StockDetail({stockData}: {stockData: any}): React.ReactElement {
  return (
    <>
      <StockHeading stockData={stockData} />
      <StockDescriptionList stockData={stockData} />
    </>
  )
}

export function StockHeading({stockData}: {stockData: any}): React.ReactElement {
  /* 
  Refer to https://developer.tdameritrade.com/content/streaming-data#_Toc504640598
  for meaning of ['#'] indexed fields
  */

  const router = useRouter();

  const params = router.query;
  const symbol: string = params.symbol[0];

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
        <BuyForm stockSymbol={symbol} symbolData={stockData} /> <br/><br/>
        <span className={stockDetailStyles.bidPrice}> {stockData[labelToField.bid].toFixed(2)} </span>
        <SellForm stockSymbol={symbol} symbolData={stockData} /> 
      </span> <br/><br/>
      <WatchForm stockSymbol={stockData.key}/>
    </>
  )
}

export function StockDescriptionList({stockData}: {stockData: any}): React.ReactElement {
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

export function WatchForm({stockSymbol}: {stockSymbol: string}): React.ReactElement {
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