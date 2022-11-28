import Router from '@koa/router';
import fetch from 'isomorphic-fetch';
import { CustomContext } from '../typings/types';

// const API_DOMAIN = 'yahoo-finance97.p.rapidapi.com';
const API_DOMAIN = 'yfinance-stock-market-data.p.rapidapi.com';

const API_BASE_URL=`https://${API_DOMAIN}`;

export const router = new Router({prefix: '/stock-info'});

// Route to fetch from Yahoo's /stock-info endpoint
router.get('/quote/:ticker', async (ctx: CustomContext) => {
	const encodedParams = new URLSearchParams();
	const ticker = ctx.params['ticker'];
	encodedParams.append("symbol", ticker);

	const options: any = createOptionsJSON(encodedParams);

	let queryData: any = {};

	try {
		const response = await fetch(`${API_BASE_URL}/stock-info`, options)

		if(!response.ok) {
			throw new Error("Bad response from server");
		}
		queryData = await response.json();

	} catch (e) {
		ctx.status = 400;
		ctx.body = {message: "Error fetching response from server!", status: ctx.status};
		return;
	}

	/* Invalid tickers still return OK 200 response in format of,
	{
		data: {
			logo_url: "",
			preMarketPrice: null,
			regularMarketPrice: null
		},
		message: "Success",
		status: 200
	} 
	so create error message if this data is received before passing to body */
	if(!queryData.data.regularMarketPrice) {
		ctx.status = 400;
		ctx.body = {message: "Invalid ticker symbol", status: ctx.status};
		return;
	}

	ctx.status = 200;
	ctx.body = {message: queryData, status: ctx.status};
});

// Route to fetch from Yahoo's /news endpoint
router.get('/news/:commaSepTickers', async (ctx: CustomContext) => {
	const tickers = ctx.params['commaSepTickers'].split(',');
	const news: any = {};

	try {
		for(const ticker of tickers) {
			news[ticker] = {};

			const encodedParams = new URLSearchParams();
			encodedParams.append("symbol", ticker);

			const options: any = createOptionsJSON(encodedParams);

			const response = await fetch(`${API_BASE_URL}/news`, options)

			if(!response.ok) {
				throw new Error("Bad response from server");
			}
			const queryData = await response.json();

			// Parse data to be accessible by ticker symbol
			news[ticker] = queryData.data;
		}
		ctx.status = 200;
		ctx.body = {message: news, status: ctx.status};
		
	} catch (e) {
		ctx.status = 400;
		ctx.body = {message: "Error fetching news", status: ctx.status};
	}
});

// Route to fetch from Yahoo's /earnings endpoint
router.get('/earnings/:ticker', async (ctx: CustomContext) => {
	const encodedParams = new URLSearchParams();
	const ticker = ctx.params['ticker'];
	encodedParams.append("symbol", ticker);

	const options: any = createOptionsJSON(encodedParams);

	let queryData: any = {};

	try {
		const response = await fetch(`${API_BASE_URL}/earnings`, options)

		if(!response.ok) {
			throw new Error("Bad response from server");
		}
		queryData = await response.json();
		ctx.status = 200;
		ctx.body = {message: queryData, status: ctx.status};

	} catch (e) {
		ctx.status = 400;
		ctx.body = {message: "Error fetching response from server!", status: ctx.status};
	}
});

// Route to fetch from Yahoo's /quarterly-earnings endpoint
router.get('/quarterly-earnings/:ticker', async (ctx: CustomContext) => {
	const encodedParams = new URLSearchParams();
	const ticker = ctx.params['ticker'];
	encodedParams.append("symbol", ticker);

	const options: any = createOptionsJSON(encodedParams);

	let queryData: any = {};

	try {
		const response = await fetch(`${API_BASE_URL}/quarterly-earnings`, options)

		if(!response.ok) {
			throw new Error("Bad response from server");
		}
		queryData = await response.json();

		ctx.status = 200;
		ctx.body = {message: queryData, status: ctx.status};

	} catch (e) {
		ctx.status = 400;
		ctx.body = {message: "Error fetching response from server!", status: ctx.status};
	}

});

// Fetch from /price endpoint allowing for Price by period (1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max) functionality
router.get('/price/:period/:ticker', async (ctx: CustomContext) => {
	const encodedParams = new URLSearchParams();
	const ticker = ctx.params['ticker'];
	const period = ctx.params['period'];

	// TODO: Add validation for period or just use default returned response on error
	encodedParams.append("period", period)
	encodedParams.append("symbol", ticker);

	const options: any = createOptionsJSON(encodedParams);

	let queryData: any = {};

	try {
		const response = await fetch(`${API_BASE_URL}/price`, options)

		if(!response.ok) {
			throw new Error("Bad response from server");
		}
		queryData = await response.json();
		ctx.status = 200;
		ctx.body = {message: queryData, status: ctx.status};

	} catch (e) {
		ctx.status = 400;
		ctx.body = {message: "Error fetching response from server!", status: ctx.status};
	}

});


function createOptionsJSON(encodedParams: URLSearchParams) {
	return (
		{
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'X-RapidAPI-Key': process.env.RAPID_API_YAHOO_KEY,
				'X-RapidAPI-Host': API_DOMAIN
			},
			body: encodedParams
		}
	)
}

export default router;
