import Koa from 'koa';
import Router from '@koa/router';
import koaBody from 'koa-body';
import cors from '@koa/cors';
import fetch from 'isomorphic-fetch';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import userRouter from './mongodb/routes/users.js';

const app = new Koa();
const router = new Router();
const port = 3011;
dotenv.config();

const db_name = "stock-sim";
const uri = `mongodb://localhost:27017/${db_name}`;
mongoose.connect(uri);

app.use(koaBody());
app.use(cors({origin: '*'}));

router.get('/', (ctx) => {
	console.log(ctx.request);
	ctx.body = {'Server\'s API Endpoints': {
		'Get information of specific stock': {
			'route' : '/stock-info/:ticker',
			'example' : 'http://localhost:3011/stock-info/AAPL'},
	}};
});

// Route to fetch from Yahoo's /stock-info endpoint
router.get('/stock-info/:ticker', async (ctx) => {
	const encodedParams = new URLSearchParams();
	const ticker = ctx.params['ticker'];
	encodedParams.append("symbol", ticker);

	const options = {
		method: 'POST',
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			'X-RapidAPI-Key': process.env.RAPID_API_YAHOO_KEY,
			'X-RapidAPI-Host': 'yahoo-finance97.p.rapidapi.com'
		},
		body: encodedParams
	}

	let queryData = {};

	try {
		const response = await fetch('https://yahoo-finance97.p.rapidapi.com/stock-info', options)

		if(!response.ok) {
			throw new Error("Bad response from server");
		}
		queryData = await response.json();

	} catch (e) {
		throw new Error("Error fetching response from server!");
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
		throw new Error("Invalid ticker symbol");
	}

	ctx.body = queryData;
});

app.use(async (ctx, next) => {
	await next();
	const rt = ctx.response.get('X-Response-Time');
	console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

app.use(async (ctx, next) => {
	const start = Date.now();
	await next();
	const ms = Date.now() - start;
	ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(router.routes());
app.use(userRouter.routes());

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
