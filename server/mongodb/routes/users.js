import Router from '@koa/router';
import bcrypt from 'bcrypt';

import User from '../models/user.js';

const router = new Router({ prefix: '/users' })
// Default is 10, but setting this variable allows for potential config.
const saltRounds = 10;

router.get('/', async (ctx) => {
	ctx.body = await User.find();
});

router.get('/:username', async (ctx) => {
	ctx.body = await User.find({username: ctx.params['username']});
});

// Create user
router.post('/signup', async (ctx) => {
  /*
    ctx.request.body will only work with koaBody in db.js
    curl -H 'Content-Type: application/json' -d '{"username": "text", "email":"testemail", "password": "insecure"}' \
      -X POST http://localhost:3012/users/signup
    should return {"username": "name"}
  */
  const postBody = ctx.request.body;
  const username = postBody.username;
  const email = postBody.email;
  const password = postBody.password;

  if(!(username && email && password)) {
    ctx.status = 400;
    throw new Error("Invalid form data!");
  }

  try {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = new User({username: username, email: email, password: hash});
    await newUser.save();

    ctx.body = `${newUser.details()} `;
  } catch (error) {
    ctx.body = error;
  }

});


export default router;
