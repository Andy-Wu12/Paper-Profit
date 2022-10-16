import { useState, useEffect } from 'react';
import styles from '../../styles/Home.module.css'

export default function StockSearchForm() {
  const [stock, setStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stockData, setStockData] = useState(null);
  
  function handleSubmit(e) {
    e.preventDefault();
    console.log('Search initiated')
  }

  return (
    <>
      <form className={styles.card} method='POST' onSubmit={handleSubmit}>
        <label htmlFor='ticker-symbol'> Search Ticker Symbol </label><br/>
        <input type='text' placeholder='AAPL' name='ticker-symbol' id='ticker-symbol' />
        <button type='submit'> Search </button>
      </form>
    </>
  )
}