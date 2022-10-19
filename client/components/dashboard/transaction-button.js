import { useContext } from "react";
import AuthContext from "../authentication/authContext";
import { useRouter } from "next/router";

import stockDetailStyles from '../../styles/StockDetail.module.css';

export function BuyButton() {
  const user = useContext(AuthContext);

  return (
    <>

    </>
  )
}

export function SellButon() {

}