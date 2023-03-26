import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import Charts from "../../charts/charts";

export default function YearlyEarningsGraph(): JSX.Element {
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
    setEarningsData(data.message);
  }

  useEffect(() => {
    getYearlyEarnings();
  }, [symbol]);

  let graphData = [
    ["Year", "Earnings", "Revenue"],
  ]

  if(earningsData) {
    earningsData.data?.map((data: any) => {
      graphData.push([data.Year.toString(), data.Earnings, data.Revenue]);
    });
  }

  return (
    <>
      <Charts.ColumnGraph data={graphData} options={options} />
    </>
  )
}