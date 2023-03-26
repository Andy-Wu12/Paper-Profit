import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import Charts from "../../charts/charts";

export default function QuarterlyEarningsChart(): JSX.Element {
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
    setEarningsData(data.message);
  }

  useEffect(() => {
    getQuarterlyEarnings();
  }, [symbol]);

  let graphData = [
    ["Quarter", "Earnings", "Revenue"],
  ]

  if(earningsData) {
    earningsData.data?.map((data: any) => {
      const quarter = data.Quarter;
      graphData.push([quarter, data.Earnings, data.Revenue]);
    })
  }

  return (
    <>
      <Charts.ColumnGraph data={graphData} options={options} />
    </>
  )
}