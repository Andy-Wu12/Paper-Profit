import Router from '@koa/router';

import User from '../mongodb/models/user.js';
import Session from '../mongodb/models/session.js';
import { sessionCookieName } from './auth.js';

const router = new Router({ prefix: '/users' })


router.get('/', async (ctx) => {
	ctx.body = await User.find();
});

router.get('/session', async (ctx) => {
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

});

router.get('/:username', async (ctx) => {
	ctx.body = await User.find({username: ctx.params['username']});
});

export default router;
