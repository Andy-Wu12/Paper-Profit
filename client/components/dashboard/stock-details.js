import { useState, useEffect } from 'react';
import styles from '../../styles/Home.module.css'

export default function StockDetails({stockData}) {  
  const isSuccess = stockData.message === 'Success';

  return (
    <div className={styles.card}>
      {isSuccess ? <h2> {stockData.data.longName} </h2> : <h2> Invalid Ticker Symbol </h2>}
    
    </div>
  )
}
