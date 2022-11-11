import Router from '@koa/router';
import fetch from 'isomorphic-fetch';


export const router = new Router({prefix: '/stock-info'});

// Route to fetch from Yahoo's /stock-info endpoint
router.get('/quote/:ticker', async (ctx) => {
	const encodedParams = new URLSearchParams();
	const ticker = ctx.params['ticker'];
	encodedParams.append("symbol", ticker);

	const options = createOptionsJSON(encodedParams);

	let queryData = {};

	try {
		const response = await fetch('https://yahoo-finance97.p.rapidapi.com/stock-info', options)

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

	ctx.body = queryData;
});

// Route to fetch from Yahoo's /news endpoint
router.get('/news/:commaSepTickers', async (ctx) => {
	const tickers = ctx.params['commaSepTickers'].split(',');
	const news = {};

	try {
		for(const ticker of tickers) {
			news[ticker] = {};

			const encodedParams = new URLSearchParams();
			encodedParams.append("symbol", ticker);

			const options = createOptionsJSON(encodedParams);

			const response = await fetch('https://yahoo-finance97.p.rapidapi.com/news', options)

			if(!response.ok) {
				throw new Error("Bad response from server");
			}
			const queryData = await response.json();

			// Parse data to be accessible by ticker symbol
			news[ticker] = queryData.data;
		}

	} catch (e) {
		ctx.status = 400;
		ctx.body = {message: e.message, status: ctx.status};
		return;
	}

	ctx.body = news;
});

// Route to fetch from Yahoo's /earnings endpoint
router.get('/earnings/:ticker', async (ctx) => {
	const encodedParams = new URLSearchParams();
	const ticker = ctx.params['ticker'];
	encodedParams.append("symbol", ticker);

	const options = createOptionsJSON(encodedParams);

	let queryData = {};

	try {
		const response = await fetch('https://yahoo-finance97.p.rapidapi.com/earnings', options)

		if(!response.ok) {
			throw new Error("Bad response from server");
		}
		queryData = await response.json();

	} catch (e) {
		ctx.status = 400;
		ctx.body = {message: "Error fetching response from server!", status: ctx.status};
		return;
	}

	ctx.body = queryData;
});

// Route to fetch from Yahoo's /quarterly-earnings endpoint
router.get('/quarterly-earnings/:ticker', async (ctx) => {
	const encodedParams = new URLSearchParams();
	const ticker = ctx.params['ticker'];
	encodedParams.append("symbol", ticker);

	const options = createOptionsJSON(encodedParams);

	let queryData = {};

	try {
		const response = await fetch('https://yahoo-finance97.p.rapidapi.com/quarterly-earnings', options)

		if(!response.ok) {
			throw new Error("Bad response from server");
		}
		queryData = await response.json();

	} catch (e) {
		ctx.status = 400;
		ctx.body = {message: "Error fetching response from server!", status: ctx.status};
		return;
	}

	ctx.body = queryData;
});

// Fetch from /price endpoint allowing for Price by period (h,d,wk,y) functionality
router.get('/price/:period/:ticker', async (ctx) => {
	const encodedParams = new URLSearchParams();
	const ticker = ctx.params['ticker'];
	const period = ctx.params['period'];

	// TODO: Add validation for period or just use default returned response on error
	encodedParams.append("period", period)
	encodedParams.append("symbol", ticker);

	const options = createOptionsJSON(encodedParams);

	let queryData = {};

	try {
		const response = await fetch('https://yahoo-finance97.p.rapidapi.com/price', options)

		if(!response.ok) {
			throw new Error("Bad response from server");
		}
		queryData = await response.json();

	} catch (e) {
		ctx.status = 400;
		ctx.body = {message: "Error fetching response from server!", status: ctx.status};
		return;
	}

	ctx.body = queryData;
});



function createOptionsJSON(encodedParams) {
	return (
		{
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'X-RapidAPI-Key': process.env.RAPID_API_YAHOO_KEY,
				'X-RapidAPI-Host': 'yahoo-finance97.p.rapidapi.com'
			},
			body: encodedParams
		}
	)
}

export default router;
