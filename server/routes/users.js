import Router from '@koa/router';

import User from '../mongodb/models/user.js';
import Session from '../mongodb/models/session.js';
import { sessionCookieName } from './auth.js';
import Portfolio from '../mongodb/models/portfolio.js';
import Transaction from '../mongodb/models/transaction.js';

const router = new Router({ prefix: '/users' })


router.get('/', async (ctx) => {
	ctx.body = await User.find();
});

router.get('/session', async (ctx) => {
	try {
		const requestCookies = ctx.request.headers.cookie;
		const cookies = requestCookies.split('; ');
		const sessionCookie = cookies.find(element => element.startsWith(`${sessionCookieName}=`));
		
		if(!sessionCookie) {
			ctx.body = {message: 'Session cookie not found!'};
			ctx.status = 400;
			return;
		}

		const cookieStr = sessionCookie.split('=')[1];
		const sessionDoc = await Session.findOne({cookie: cookieStr});

		if(!sessionDoc) {
			ctx.body = {message: 'Invalid session cookie!'};
			ctx.status = 400;
			return;
		}
		ctx.body = {message: 'Success', username: sessionDoc.username};
		ctx.status = 200;

	} catch (e) {
		ctx.body = {message: 'Error occurred!'};
		ctx.status = 400;
		return;
	}

});

router.get('/:username/holdings', async (ctx) => {
	try {
		const portfolio = await Portfolio.findOne({username: ctx.params['username']});
		const holdings = portfolio.holdings;
		const uniqueSymbols = Array.from(new Set(holdings.map((holding) => { return holding.symbol } )));
		
		/* Combine all different holdings of same symbol into one
			{
				unique_symbol: string {
					# shares: int,
					totalPrice: float,
					avgPrice: float,
				}
				uniqueSymbolTwo: string {
					# shares: int, 
					totalPrice: float,
					avgPrice: float,
				}
			}
		*/
		const symbolData = {};

		for(const symbol of uniqueSymbols) {
			symbolData[symbol] = { quantity: 0, totalPrice: 0, avgPrice: 0 };
		}

		// Process all positions and update corresponding symbol's data
		for(const holding of holdings) {
			const positionData = symbolData[holding.symbol];

			positionData.quantity += holding.quantity;
			positionData.totalPrice += holding.pricePerShare * holding.quantity;
			positionData.avgPrice = positionData.totalPrice / positionData.quantity;
		}
		
		ctx.body = symbolData;
		
	} catch (e) {
		ctx.status = 400;
		ctx.message = e.message;
	}
});

router.post('/:username/reset', async (ctx) => {
	const username = ctx.params['username'];
	try {
		const portfolio = await Portfolio.findOne({username: username});
		const user = await User.findOne({username: username})
		// Reset portfolio
		portfolio.holdings = [];
		portfolio.value = 0;
		portfolio.save();

		// Reset balance
		user.balance = 100000;
		user.save();
		
		// Delete all transactions made by user
		await Transaction.deleteMany({ username: username});

		ctx.status = 200;
		ctx.body = {message: "Success", status: ctx.status};
		
	} catch (e) {
		ctx.status = 400;
		ctx.message = e.message;
	}
});

router.get('/:username', async (ctx) => {
	ctx.body = await User.findOne({username: ctx.params['username']});
});

export default router;
