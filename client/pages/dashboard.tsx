import Head from 'next/head'
import {useRouter} from 'next/router'
import React, { useState, useContext, useEffect, ReactElement, FormEventHandler, MouseEventHandler } from 'react'

import styles from '../styles/Home.module.css'
import dashboardStyles from '../styles/dashboard.module.css'

import AuthContext from '../components/authentication/authContext'
import StockSearchForm, {subscriptionFields} from '../components/dashboard/stock-search'
import StockDetails from '../components/dashboard/stock-details'
import Ameritrade from '../components/generic/ameritrade-websocket'

import Positions from '../components/dashboard/positions'
import ActionButton from '../components/generic/action-button'
import Loading from '../components/generic/loading'
import TD_WebsocketContext from '../components/generic/td-websocketContext'
import Watchlist from '../components/watchlist/watchlist_main'
import TransactionQuantities from '../components/dashboard/transaction-quantity'
import Charts from '../components/charts/charts';
import SelectDropdown from '../components/generic/dropdown-select';

// Types
import { AuthContextProps } from '../components/authentication/authContext';
import { WebsocketProps } from '../components/generic/td-websocketContext'

export type setterPropsProps = {
  setStockData: React.Dispatch<any>,
  setDashboardComponent: React.Dispatch<any>,
  setIsLoading: React.Dispatch<any>,
  setHasSearched: React.Dispatch<any>,
  setLastSearch: React.Dispatch<any>
}

export default function Dashboard(): React.ReactElement {
  const user: AuthContextProps = useContext(AuthContext);
  const websocketCtx: WebsocketProps = useContext(TD_WebsocketContext);

  const router = useRouter();

  const [stockData, setStockData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearch, setLastSearch] = useState(null);
  const [dashboardComponent, setDashboardComponent] = useState('positions');
  const [isLoading, setIsLoading] = useState(false);

  const setterProps: setterPropsProps = {
    setStockData: setStockData,
    setDashboardComponent: setDashboardComponent,
    setIsLoading: setIsLoading,
    setHasSearched: setHasSearched,
    setLastSearch: setLastSearch
  }
  
  ///// Handle conditional rendering for the three different dashboard components /////
  const ENUM_COMPONENTS = {
    quote: (hasSearched && stockData) ? <> <StockSearch stockData={stockData} /> </> : <> No stock quote to show </>,
    watch: <Watchlist setterProps={setterProps} />,
    positions: <Positions websocket={websocketCtx.websocket} setterProps={setterProps} />
  }

  function EnumState({state}: {state: string}) {
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
        <NavMenu setterProps={setterProps} setDashboardComponent={setDashboardComponent} lastSearch={lastSearch} websocket={websocketCtx.websocket} />
        <StockSearchForm setterProps={setterProps} websocket={websocketCtx.websocket} />

        {dashboardComponent == 'quote' && <TransactionQuantities />}
        <div className={[dashboardStyles.conditionalRenderSection, styles.centered].join(' ')}>
          {/* Components that conditionally render */}
          {isLoading ? <Loading /> : 
          <EnumState state={dashboardComponent} />}
          {/* {dashboardComponent == 'quote' && <StockCharts />} */}
        </div>
      </div>
    </div>
  );
}

function StockSearch({stockData}: {stockData: any}): React.ReactElement {
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

function StockCharts(): React.ReactElement {
  return (
    <div className='stockChartsContainer'>
      <PeriodPriceChart /> <br/><br/>
      <YearlyEarningsGraph /> <br/>
      <QuarterlyEarningsChart /> <br/>
    </div>
  )
}

type NavMenuProps = {
  setDashboardComponent: React.Dispatch<any>,
  lastSearch: string | null,
  websocket: WebSocket,
  setterProps: setterPropsProps
}

function NavMenu({setDashboardComponent, lastSearch, websocket, setterProps}: NavMenuProps): React.ReactElement {
  return (
    <nav>
      <ShowLastSearchButton setterProps={setterProps} setDashboardComponent={setDashboardComponent} websocket={websocket} lastSearch={lastSearch}/>
      <ShowHoldingsButton setDashboardComponent={setDashboardComponent} />
      <WatchListButton setDashboardComponent={setDashboardComponent} />
      <ResetAccountButton />
    </nav>
  );
}

type ShowLastSearchProps = {
  lastSearch: string | null,
  setDashboardComponent: React.Dispatch<any>
  websocket: WebSocket,
  setterProps: setterPropsProps
}

function ShowLastSearchButton({websocket, setDashboardComponent, lastSearch, setterProps}: ShowLastSearchProps): React.ReactElement {
  const router = useRouter();

  async function handleClick() {
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
    setDashboardComponent('quote');
    setterProps.setIsLoading(false);
    setterProps.setHasSearched(true);
  }

  return (
    <ActionButton onClick={handleClick} buttonText='Show Last Search' />
  );
}

function ShowHoldingsButton({setDashboardComponent}: {setDashboardComponent: React.Dispatch<any>}): React.ReactElement {
  function onClick() {
    setDashboardComponent('positions');
  }

  return (
    <ActionButton onClick={onClick} buttonText='Show Holdings' />
  );
}

function WatchListButton({setDashboardComponent}: {setDashboardComponent: React.Dispatch<any>}): React.ReactElement {
  function onClick() {
    setDashboardComponent('watch');
  }

  return (
    <ActionButton onClick={onClick} buttonText='See Watchlist' />
  );
}

function Balance({username}: {username: string}): React.ReactElement {
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

function ResetAccountButton(): React.ReactElement {
  const user = useContext(AuthContext);
  const router = useRouter();

  async function handleClick() {
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

// Dashboard Charts
function PeriodPriceChart(): JSX.Element {
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
      <SelectDropdown options={periodOptions} onChange={(e) => {setPeriod(e.target.value)}}/>
      <Charts.CandleStick data={stockChartData} options={options} />
    </>
  )
}

function YearlyEarningsGraph(): JSX.Element {
  const router = useRouter();
  const {symbol} = router.query;

  const [earningsData, setEarningsData] = useState(null);

  const options = {
    title: `${symbol} Yearly Earnings (USD)`,
    titleTextStyle: {
      color: 'white',
      bold: true,
      fontSize: 20
    },
    legend: {
      textStyle: {
        color: "white"
      }
    },
    backgroundColor: '#181818',
    width: 500,
    height: 500,
    hAxis: {
      textStyle: {
        color: 'white'
      }
    },
    vAxis: {
      format: 'short',
      textStyle: {
        color: 'white'
      }
    },
  }

  const getYearlyEarnings = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/stock-info/earnings/${symbol}`;
    const response = await fetch(url);
    const data = await response.json();
    setEarningsData(data);
  }

  useEffect(() => {
    getYearlyEarnings();
  }, [symbol]);

  let graphData = [
    ["Year", "Earnings", "Revenue"],
  ]

  if(earningsData) {
    for(const data of earningsData.data) {
      graphData.push([data.Year.toString(), data.Earnings, data.Revenue]);
    }
  }

  return (
    <>
      <Charts.ColumnGraph data={graphData} options={options} />
    </>
  )
}

function QuarterlyEarningsChart(): JSX.Element {
  const router = useRouter();
  const {symbol} = router.query;

  const [earningsData, setEarningsData] = useState(null);

  const options = {
    title: `${symbol} Quarterly Earnings (USD)`,
    titleTextStyle: {
      color: 'white',
      bold: true,
      fontSize: 20
    },
    legend: {
      textStyle: {
        color: "white"
      }
    },
    backgroundColor: '#181818',
    width: 500,
    height: 500,
    hAxis: {
      title: 'Quarter',
      titleTextStyle: {
        color: 'white',
      },
      textStyle: {
        color: 'white',
      }
    },
    vAxis: {
      format: 'short',
      textStyle: {
        color: 'white'
      }
    },
  }

  const getQuarterlyEarnings = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/stock-info/quarterly-earnings/${symbol}`;
    const response = await fetch(url);
    const data = await response.json();
    setEarningsData(data);
  }

  useEffect(() => {
    getQuarterlyEarnings();
  }, [symbol]);

  let graphData = [
    ["Quarter", "Earnings", "Revenue"],
  ]

  if(earningsData) {
    for(const data of earningsData.data) {
      const quarter = data.Quarter;
      graphData.push([quarter, data.Earnings, data.Revenue]);
    }
  }

  return (
    <>
      <Charts.ColumnGraph data={graphData} options={options} />
    </>
  )
}
