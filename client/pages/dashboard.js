import Head from 'next/head'
import {useRouter} from 'next/router'
import { useState, useContext, useEffect } from 'react'

import styles from '../styles/Home.module.css'
import dashboardStyles from '../styles/dashboard.module.css'

import AuthContext from '../components/authentication/authContext.js'
import StockSearchForm, {subscriptionFields} from '../components/dashboard/stock-search.js'
import StockDetails from '../components/dashboard/stock-details.js'
import Ameritrade from '../components/generic/ameritrade-websocket'

import Positions from '../components/dashboard/positions.js'
import ActionButton from '../components/generic/action-button'
import Loading from '../components/generic/loading'
import TD_WebsocketContext from '../components/generic/td-websocketContext'
import Watchlist from '../components/watchlist/watchlist_main'
import TransactionQuantities from '../components/dashboard/transaction-quantity.js'
import CandleStickChart from '../components/charts/candlestick';
import SelectDropdown from '../components/generic/dropdown-select';

export default function Dashboard() {
  const user = useContext(AuthContext);
  const websocketCtx = useContext(TD_WebsocketContext);

  const router = useRouter();

  const [stockData, setStockData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearch, setLastSearch] = useState(null);
  const [dashboardComponent, setDashboardComponent] = useState('positions');
  const [isLoading, setIsLoading] = useState(false);

  const setterProps = {
    setStockData,
    setDashboardComponent,
    setIsLoading,
    setHasSearched,
    setLastSearch
  }
  
  ///// Handle conditional rendering for the three different dashboard components /////
  const ENUM_COMPONENTS = {
    quote: (hasSearched && stockData) ? <> <StockSearch stockData={stockData} /> </> : <> No stock quote to show </>,
    watch: <Watchlist setDashboardComponent={setDashboardComponent} {...setterProps} />,
    positions: <Positions websocket={websocketCtx.websocket} {...setterProps} />
  }

  function EnumState({state}) {
    return <> {ENUM_COMPONENTS[state]} </>
  }
  ///// /////

  useEffect(() => {
    if(!localStorage.getItem('user') || !user.name) { 
      router.push('/');
    }

  }, [user.name])

  return (
    <div className={styles.container}>
      <Head>
        <title>{`${user.name}'s Dashboard`}</title>
        <meta name="description" content="Stock Trading Simulator Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className={styles.title}> Dashboard </h1>
      {/* Components that should always render */}
      <div className={styles.main}> 
        <Balance username={user.name} />
        <NavMenu {...setterProps} setDashboardComponent={setDashboardComponent} lastSearch={lastSearch} websocket={websocketCtx.websocket} />
        <StockSearchForm websocket={websocketCtx.websocket} {...setterProps} />

        {dashboardComponent == 'quote' && <TransactionQuantities />}
        <div className={[dashboardStyles.conditionalRenderSection, styles.centered].join(' ')}>
          {/* Components that conditionally render */}
          {isLoading ? <Loading /> : 
          <EnumState state={dashboardComponent} />}
          {dashboardComponent == 'quote' && <StockChart />}
        </div>
      </div>
    </div>
  );
}

function StockSearch({stockData}) {
  return (
    <>
      {stockData && 
        <> 
          <StockDetails stockDataJSON={stockData} /> 
        </>
      }
    </>
  );
}

function NavMenu({setDashboardComponent, lastSearch, websocket, ...setterProps}) {
  return (
    <nav>
      <ShowLastSearchButton {...setterProps} setDashboardComponent={setDashboardComponent} websocket={websocket} lastSearch={lastSearch}/>
      <ShowHoldingsButton setDashboardComponent={setDashboardComponent} />
      <WatchListButton setDashboardComponent={setDashboardComponent} />
      <ResetAccountButton />
    </nav>
  );
}

function ShowLastSearchButton({websocket, lastSearch, ...setterProps}) {
  const router = useRouter();

  async function handleClick(e) {
    e.preventDefault();
    setterProps.setIsLoading(true);
    const tickerSymbol = lastSearch
    if(!tickerSymbol) {
      // Another option is to setStockData(null) to show error in StockDetail component, 
      // but this may be against good UX
      setterProps.setIsLoading(false);
      return;
    }
    // Set stockData(null) on new search
    setterProps.setStockData(null);
    websocket.send(JSON.stringify(Ameritrade.stockSubRequest(tickerSymbol, subscriptionFields)));

    router.push(`/dashboard/?symbol=${tickerSymbol.toUpperCase()}`);
    setterProps.setDashboardComponent('quote');
    setterProps.setIsLoading(false);
    setterProps.setHasSearched(true);
  }

  return (
    <ActionButton onClick={handleClick} buttonText='Show Last Search' />
  );
}

function ShowHoldingsButton({setDashboardComponent, lastSearch={lastSearch}}) {

  function onClick() {
    setDashboardComponent('positions');
  }

  return (
    <ActionButton onClick={onClick} buttonText='Show Holdings' />
  );
}

function WatchListButton({setDashboardComponent}) {
  function onClick() {
    setDashboardComponent('watch');
  }

  return (
    <ActionButton onClick={onClick} buttonText='See Watchlist' />
  );
}

function Balance({username}) {
  const [balance, setBalance] = useState(null);
  const [websocket, setWebsocket] = useState(null);

  useEffect(() => {
    try {
      if(!websocket && username) {
        const ws = new WebSocket("ws://localhost:3011/balance");
        ws.addEventListener('open', () => { ws.send(JSON.stringify({username: username, action: 'sub'})); });
        ws.addEventListener('message', (event) => {
          setBalance(event.data);
          // ws.send(username);
        })
        setWebsocket(ws);
      }
    } catch (e) {
      setWebsocket(null);
    }
  });

  return (
    <>
      {balance && <h2> Your Remaining Cash: {parseFloat(balance).toFixed(2)} </h2>}
    </>
  )
}

function StockChart() {
  // Chart data format = {
    // ["Label", "", "", "", ""],
      // Label -> Low / Min -> Open -> Close -> High / Max
    // ["Mon", 20, 28, 38, 45],
    // ["Tue", 31, 38, 55, 66],
  // }
  const router = useRouter();
  const {symbol} = router.query;

  const [period, setPeriod] = useState('5d');
  const [periodData, setPeriodData] = useState(null);

  // Options reference: https://developers.google.com/chart/interactive/docs/gallery/candlestickchart#data-format
  const options = {
    title: `${symbol} Price History - ${period}`,
    titleTextStyle: {
      color: 'white',
      bold: true,
      fontSize: 20
    },
    legend: "none",
    backgroundColor: '#181818',
    width: 500,
    height: 500,
    hAxis: {
      textStyle: {
        color: 'white'
      }
    },
    vAxis: {
      textStyle: {
        color: 'white'
      }
    },
    bar: { groupWidth: "75%" }, // Remove space between bars.
    candlestick: {
      fallingColor: { strokeWidth: 0, fill: "#a52714" }, // red
      risingColor: { strokeWidth: 0, fill: "#0f9d58" }, // green
    },
  };

  const periodOptions = ['5d','1d','10d','1mo','3mo','6mo','1y','2y','5y','10y','ytd','max'] 

  const getPeriodData = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/stock-info/price/${period}/${symbol}`;
    const response = await fetch(url);
    const newPeriodData = await response.json();
    setPeriodData(newPeriodData);
  }

  useEffect(() => {
    getPeriodData();
  }, [period, symbol])

  let stockChartData = [
    ["Day", "", "", "", ""],
  ];

  if(periodData) {
    for(const data of periodData.data) {
      const date = new Date(data.Date);
      const dateLabel = `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
      stockChartData.push([dateLabel, data.Low, data.Open, data.Close, data.High]);
    }
  }

  return (
    <>  
      <CandleStickChart symbolData={stockChartData} options={options} />
      <SelectDropdown options={periodOptions} onChange={(e) => {setPeriod(e.target.value)}}/>
    </>
  )
}

function ResetAccountButton() {
  const user = useContext(AuthContext);
  const router = useRouter();

  async function handleClick(e) {
    if(user.name) {
      await fetch(`http://localhost:3011/users/${user.name}/reset`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        },
      });
    }
    router.reload();
  }

  return (
    <ActionButton onClick={handleClick} buttonText='Reset Portfolio' />
  )
}