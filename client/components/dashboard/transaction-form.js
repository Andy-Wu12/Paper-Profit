import { useContext } from "react";
import AuthContext from "../authentication/authContext";
import { useRouter } from "next/router";

import stockDetailStyles from '../../styles/StockDetail.module.css';
import ActionButton from '../generic/action-button';

// TODO: Allow user to choose amount of shares to purchase / sell
export function BuyForm({stockSymbol, symbolData}) {
  /* 
  Refer to https://developer.tdameritrade.com/content/streaming-data#_Toc504640598
  for meaning of ['#'] indexed fields
  */
  const user = useContext(AuthContext);
  const inputID = 'buy-quantity-input';

  const buy = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/buy?symbol=${stockSymbol}`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": user.name,
        "price": symbolData['2'],
        "quantity": document.getElementById(inputID).value
      })
    });
  }

  return (
    <>
      <ActionButton onClick={buy} buttonText='Buy' className={stockDetailStyles.buy} /> &nbsp;
      <input type="number" className={stockDetailStyles.quantityInput} defaultValue='1' id={inputID} name="buy-quantity" />
    </>
  )
}

export function SellForm({stockSymbol, symbolData}) {
  const user = useContext(AuthContext);
  const inputID = 'sell-quantity-input';

  const sell = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/sell?symbol=${stockSymbol}`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": user.name,
        "price": symbolData['1'],
        "quantity": document.getElementById(inputID).value
      })
    });
  }

  return (
    <>
      <ActionButton onClick={sell} buttonText='Sell' className={stockDetailStyles.sell} /> &nbsp;
      <input type="number" className={stockDetailStyles.quantityInput} defaultValue='1' id={inputID} name="sell-quantity" />
    </>
  )
}

export default { BuyForm, SellForm };
