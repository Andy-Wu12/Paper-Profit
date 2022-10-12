import Router from '@koa/router';
import bcrypt from 'bcrypt';

import User from '../models/user.js';

const router = new Router({ prefix: '/users' })

router.get('/', async (ctx) => {
	ctx.body = await User.find();
});

router.get('/:username', async (ctx) => {
	ctx.body = await User.find({username: ctx.params['username']});
});

// Create user
router.post('/', async (ctx) => {
  /*
    ctx.request.body will only work with koaBody in db.js
    curl -H 'Content-Type: application/json' -d '{"username": "text", "email":"testemail", "password": "insecure"}' -X POST http://localhost:3012/users
    should return {"username": "name"}
  */
  const postBody = ctx.request.body;
  // const username = postBody.username;
  // const email = postBody.email;
  // const password = postBody.password;

  // TODO: Add input validation
  const newUser = new User(postBody);
  newUser.save();

  ctx.body = `${newUser.details()} `;

});


export default router;
