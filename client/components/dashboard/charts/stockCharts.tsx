import PeriodPriceChart from "./periodPriceChart"
import YearlyEarningsGraph from "./yearlyEarningsChart"
import QuarterlyEarningsChart from "./quarterlyEarningsChart"

export default function StockCharts(): React.ReactElement {
  return (
    <div className='stockChartsContainer'>
      <PeriodPriceChart /> <br/><br/>
      <YearlyEarningsGraph /> <br/>
      <QuarterlyEarningsChart /> <br/>
    </div>
  )
}