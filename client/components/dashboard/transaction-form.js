import { useContext } from "react";
import AuthContext from "../authentication/authContext";
import { useRouter } from "next/router";

import stockDetailStyles from '../../styles/StockDetail.module.css';
import ActionButton from '../generic/action-button';

// TODO: Allow user to choose amount of shares to purchase / sell
export function BuyForm({stockSymbol}) {
  const user = useContext(AuthContext);
  const router = useRouter();

  const buy = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/buy?symbol=${stockSymbol}`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": user.name
      })
    });
    // router.reload();
  }

  return (
    <>
      <ActionButton onClick={buy} buttonText='Buy' className={stockDetailStyles.buy} />
    </>
  )
}

export function SellForm({stockSymbol}) {
  const user = useContext(AuthContext);

  const sell = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/sell?symbol=${stockSymbol}`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": user.name
      })
    });
  }

  return (
    <>
      <ActionButton onClick={sell} buttonText='Sell' className={stockDetailStyles.sell} />
    </>
  )
}

export default { BuyForm, SellForm };
