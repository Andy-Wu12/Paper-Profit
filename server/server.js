import Koa from 'koa';
import Router from '@koa/router';
import koaBody from 'koa-body';
import websockify from 'koa-websocket';

import cors from '@koa/cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import userRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import stockRouter from './routes/yahoo-api.js';
import transactionRouter from './routes/transaction.js';
import wsRouter from './routes/websockets.js';
import watchlistRouter from './routes/watchlist.js';

const app = websockify(new Koa());
const router = new Router();
const port = 3011;
dotenv.config();

const uri = process.env.MONGO_URI;
mongoose.connect(uri);

app
	// .use(session(CONFIG, app))
	.use(cors({origin: process.env.FRONTEND_BASE_URL, credentials: true}));
	
app.use(koaBody());

const baseURL = `http://localhost:${port}`
// Use index route to list all server endpoints
router.get('/', (ctx) => {
	ctx.body = {'Server\'s API Endpoints': {
		'Stock Info' : {
			'Base route' : '/stock-info',
			'Sub routes' : [
				{
					'Get quote information of specific stock': {
						'sub-route' : '/quote/:ticker',
						'examples' : `${baseURL}/stock-info/quote/AAPL`
					}
				},
				{
					'Get news of specific stock': {
						'sub-route' : '/news/:ticker',
						'examples' : `${baseURL}/stock-info/news/AAPL`
					}
				},
				{
					'Get earnings data of specific stock': {
						'sub-route' : '/earnings/:ticker',
						'examples': `${baseURL}/stock-info/earnings/AAPL`
					}
				},
				{
					'Get quarterly earnings of specific stock': {
						'sub-route' : '/quarterly-earnings/:ticker',
						'examples' : `${baseURL}/stock-info/quarterly-earnings/AAPL`
					}
				},
				{
					'Get prices of a stock by desired period': {
						'sub-route' : '/price/:period/:ticker',
						'examples' : `${baseURL}s/stock-info/price/1wk/AAPL`
					}
				}
			],
		},
		'Users' : {
			'Base route' : '/users',
			'Sub routes' : [
				{
					'Get list of all users': {
						'route' : '/',
						'examples' : `${baseURL}/users`
					}
				},
				{
					'Get specific user': {
						'route' : '/users/:username',
						'examples' : `${baseURL}/users/user1`
					}
				},
			]
		}
	}};
});

app.use(async (ctx, next) => {
	ctx.set('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
	ctx.set('Access-Control-Allow-Credentials', 'true');
	await next();
});

// app.use(async (ctx, next) => {
// 	await next();
// 	const rt = ctx.response.get('X-Response-Time');
// 	console.log(`${ctx.method} ${ctx.url} - ${rt}`);
// });

app.use(async (ctx, next) => {
	const start = Date.now();
	await next();
	const ms = Date.now() - start;
	ctx.set('X-Response-Time', `${ms}ms`);
});

// Websocket routes
app.ws.use(wsRouter.routes());

app.use(router.routes());
app.use(userRouter.routes());
app.use(authRouter.routes());
app.use(stockRouter.routes());
app.use(transactionRouter.routes());
app.use(watchlistRouter.routes());

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
