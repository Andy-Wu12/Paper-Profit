import ActionButton from "./action-button";

import { useRouter } from "next/router";
import { useContext } from "react";
import AuthContext from "../authentication/authContext";

import Ameritrade from "./ameritrade-websocket";
import { subscriptionFields } from "../dashboard/stock-search";

import type { setterPropsProps } from "../../pages/dashboard";

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

export {
  ShowHoldingsButton,
  ShowLastSearchButton,
  WatchListButton,
  ResetAccountButton
}