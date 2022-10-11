import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import fetch from 'isomorphic-fetch';
import dotenv from 'dotenv';

const app = new Koa();
const router = new Router();
const port = 3011;
const config = dotenv.config();


app.use(cors({origin: '*'}));

router.get('/', (ctx) => {
	console.log(ctx.request);
	ctx.body = {'Server\'s API Endpoints': {
		'Getting random dog image': {
			'route' : '/stock-info/:ticker',
			'example' : 'http://localhost:3011/stock-info/AAPL'},
	}};
});

// Route to fetch from Yahoo's /stock-info endpoint
router.get('/stock-info/:ticker', async (ctx) => {
	console.log(ctx.request);
	const encodedParams = new URLSearchParams();
	const ticker = ctx.params['ticker'];
	encodedParams.append("symbol", ticker);
	console.log(encodedParams);

	const options = {
		method: 'POST',
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			'X-RapidAPI-Key': process.env.RAPID_API_YAHOO_KEY,
			'X-RapidAPI-Host': 'yahoo-finance97.p.rapidapi.com'
		},
		body: encodedParams
	}
	const queryData = await fetch('https://yahoo-finance97.p.rapidapi.com/stock-info', options)
		.then(function(response) {
			if(response.status >= 400) {
				throw new Error("Bad response from server");
			}
			return response.json();
		})
		.then(function(data) {
			// console.log(data);
			return data;
		})
		.catch(error => {throw new Error(error)});
	
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

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
