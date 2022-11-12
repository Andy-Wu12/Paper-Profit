import { useState, useEffect } from 'react';
import Link from 'next/link';

import Loading from '../generic/loading';
import ActionButton from '../generic/action-button';

import newsStyles from '../../styles/News.module.css';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
export const NEWS_API_URL = `${API_BASE_URL}/stock-info/news`;

export default function StockNews({symbolList}) {
  const [stockNews, setStockNews] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Self-invoking function expression
    (async function() {
      setIsLoading(true);
      const querySymbols = symbolList.join(',');
      const response = await fetch(`${NEWS_API_URL}/${querySymbols}`);
      const data = await response.json();
      setStockNews(data);
      setIsLoading(false);
    }) ();
  }, []);

  const news = [];

  if(stockNews) {
    for(const [symbol, data] of Object.entries(stockNews)) {
      const symbolList = <StockNewsSection key={`${symbol}-news`} symbol={symbol} data={data} />
      news.push(symbolList);
    }
  }

  return (
    <div className={newsStyles.news}>
      {isLoading ? <Loading /> : news}
    </div>
  )
}

function NewsLink({title, link}) {
  return (
    <>
      <a href={link} target='_blank' rel='noreferrer'>{title}</a>
    </>
  )
}

function StockNewsSection({symbol, data}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [buttonText, setButtonText] = useState('Show');

  function handleClick(e) {
    setIsCollapsed(!isCollapsed);
    if(buttonText === 'Hide') setButtonText('Show');
    else setButtonText('Hide');
  }

  return (
    <div className={newsStyles.newsList}>
      <h3> {symbol} <ActionButton onClick={handleClick} buttonText={buttonText} /> </h3>
      {!isCollapsed && 
        <ul>
          {
            data.map((newsData, i) => {
              return <li key={`${symbol}-newsItem-${i}`}>
                  <NewsLink title={newsData.title} link={newsData.link} /> 
                </li>
            })
          }
        </ul>
      }
    </div>
  )
}