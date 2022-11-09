import QuantityInput from "../generic/quantity-input";
import stockDetailStyles from '../../styles/StockDetail.module.css'

export default function TransactionQuantities() {
  const buyInputID = 'buy-quantity-input';
  const sellInputID = 'sell-quantity-input';

  return (
    <>
      Buy quantity <QuantityInput id={buyInputID} className={stockDetailStyles.quantityInput} defaultValue='1' fieldName='buy-quantity' />
      Sell quantity <QuantityInput id={sellInputID} className={stockDetailStyles.quantityInput} defaultValue='1' fieldName='sell-quantity' />
    </>
  )
}
