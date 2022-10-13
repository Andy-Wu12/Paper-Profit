import Koa from 'koa';
import Router from '@koa/router';
import koaBody from 'koa-body';
import session from 'koa-session';

import cors from '@koa/cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import userRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import stockRouter from './routes/stock.js';

const app = new Koa();
const router = new Router();
const port = 3011;
dotenv.config();

const db_name = "stock-sim";
const uri = `mongodb://localhost:27017/${db_name}`;
mongoose.connect(uri);

app.use(koaBody());

//  Koa sessions
app.keys = ['secret'];

const CONFIG = {
  key: 'koa.sess', /** (string) cookie key (default is koa.sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
  secure: false, /** (boolean) secure cookie*/
  sameSite: null, /** (string) session cookie sameSite options (default null, don't set it) */
};

app
	.use(session(CONFIG, app))
	.use(cors({origin: '*'}));

// Use index route to list all server endpoints
router.get('/', (ctx) => {
	ctx.body = {'Server\'s API Endpoints': {
		'Get information of specific stock': {
			'route' : '/stock-info/:ticker',
			'example' : 'http://localhost:3011/stock-info/AAPL'
		},
		'Get list of all users': {
			'route' : '/users',
			'example' : `http://localhost:${port}/users`
		},
		'Get specific user': {
			'route' : '/users/:username',
			'example' : `http://localhost:${port}/users/user1`
		},
	}};
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
app.use(authRouter.routes());
app.use(stockRouter.routes());

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
