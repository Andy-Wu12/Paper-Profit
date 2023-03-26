import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import SelectDropdown from "../../generic/dropdown-select";
import Charts from "../../charts/charts";

export default function PeriodPriceChart(): JSX.Element {
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
    setPeriodData(newPeriodData.message);
  }

  useEffect(() => {
    getPeriodData();
  }, [period, symbol])

  let stockChartData = [
    ["Day", "", "", "", ""],
  ];

  if(periodData) {
    periodData.data?.map((data: any) => {
      const date = new Date(data.Date);
      const dateLabel = `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
      stockChartData.push([dateLabel, data.Low, data.Open, data.Close, data.High]);
    })
  }

  return (
    <>  
      <SelectDropdown options={periodOptions} onChange={(e) => {setPeriod(e.target.value)}}/>
      <Charts.CandleStick data={stockChartData} options={options} />
    </>
  )
}
