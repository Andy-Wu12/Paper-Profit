import Router from '@koa/router';

import User from '../mongodb/models/user';
import Session from '../mongodb/models/session';
import { sessionCookieName } from './auth';
import Portfolio from '../mongodb/models/portfolio';
import Transaction from '../mongodb/models/transaction';
import { CustomContext } from '../typings/types';

const router = new Router({ prefix: '/users' })


router.get('/', async (ctx: CustomContext) => { 
	ctx.body = {message: [], status: 200};

	await User.find({}).
		then(user => {
			ctx.body['message'] = user;
		}).
		catch(err => {
			ctx.status = 500
			ctx.body = {message: "Internal Server Error", status: ctx.status};
		})
});

router.get('/session', async (ctx: CustomContext) => {
	try {
		const requestCookies = ctx.request.headers.cookie;
		if(!requestCookies) {
			throw new Error();
		}

		const cookies = requestCookies.split('; ');
		const sessionCookie = cookies.find((element: string) => element.startsWith(`${sessionCookieName}=`));
		
		if(!sessionCookie) {
			throw new Error('Session cookie not found!');
		}

		const cookieStr = sessionCookie.split('=')[1];
		const sessionDoc = await Session.findOne({cookie: cookieStr});

		if(!sessionDoc) {
			throw new Error('Invalid session cookie!');
		}

		ctx.status = 200;
		ctx.body = {
			// Refactored from .username to .message.username
			message: { username: sessionDoc.username},
			status: ctx.status
		}

	} catch (e: any) {
		ctx.status = 400;
		ctx.body = {message: 'Error occurred!', status: ctx.status};
		return;
	}
});

router.get('/:username/holdings', async (ctx: CustomContext) => {
	try {
		const portfolio = await Portfolio.findOne({username: ctx.params['username']});
		if(!portfolio) {
			throw new Error('User portfolio not found!')
		}

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
		const symbolData: any = {};

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
		ctx.status = 200;
		ctx.body = {message: symbolData, status: ctx.status};
		
	} catch (e: any) {
		ctx.status = 400;
		ctx.body = {message: 'Error occurred', status: ctx.status};
	}
});

router.post('/:username/reset', async (ctx: CustomContext) => {
	const username = ctx.params['username'];
	try {
		const portfolio = await Portfolio.findOne({username: username});
		const user = await User.findOne({username: username})
		if(!user || !portfolio) {
			throw new Error('Error fetching user details')
		}

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
		
	} catch (e: any) {
		ctx.status = 400;
		ctx.body = {message: "Error occurred", status: ctx.status};
	}
});

router.get('/:username', async (ctx: CustomContext) => {
	ctx.body = {message: [], status: 200};

	await User.findOne({username: ctx.params['username']}).
		then(user => {
			ctx.body['message'] = user;
		}).
		catch(err => {
			ctx.status = 400
			ctx.body = {message: "Error occurred", status: ctx.status};
		})
});

export default router;
