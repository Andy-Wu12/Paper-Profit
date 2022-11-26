import { useContext } from "react";

import AuthContext, { AuthContextProps } from "../authentication/authContext";
import stockDetailStyles from '../../styles/StockDetail.module.css';
import ActionButton from '../generic/action-button';

type TransactionFormProps = {
  stockSymbol: string,
  symbolData: any
}

export function BuyForm({stockSymbol, symbolData}: TransactionFormProps): React.ReactElement {
  /* 
  Refer to https://developer.tdameritrade.com/content/streaming-data#_Toc504640598
  for meaning of ['#'] indexed fields
  */
  const user: AuthContextProps = useContext(AuthContext);
  
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
        "price": (symbolData['2'] as number),
        "quantity": (document.getElementById(inputID) as HTMLInputElement).value
      })
    });
  }

  return (
    <>
      <ActionButton onClick={buy} buttonText='Buy' className={stockDetailStyles.buy} /> &nbsp;
    </>
  )
}

export function SellForm({stockSymbol, symbolData}: TransactionFormProps): React.ReactElement {
  const user: AuthContextProps = useContext(AuthContext);
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
        "price": (symbolData['1'] as number),
        "quantity": (document.getElementById(inputID) as HTMLInputElement).value
      })
    });
  }

  return (
    <>
      <ActionButton onClick={sell} buttonText='Sell' className={stockDetailStyles.sell} /> &nbsp;
    </>
  )
}

export default { BuyForm, SellForm };
