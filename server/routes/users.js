import Router from '@koa/router';

import User from '../mongodb/models/user.js';

const router = new Router({ prefix: '/users' })


router.get('/', async (ctx) => {
	ctx.body = await User.find();
});

router.get('/:username', async (ctx) => {
	ctx.body = await User.find({username: ctx.params['username']});
});


export default router;
