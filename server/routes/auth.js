import bcrypt from 'bcrypt';
import Router from '@koa/router';

import User from '../mongodb/models/user.js';


export const router = new Router({prefix: '/auth'});
// Default is 10, but setting this variable allows for potential config.
const saltRounds = 10;

// Create user
router.post('/signup', async (ctx) => {
  /*
    ctx.request.body will only work with koaBody in db.js
    curl -H 'Content-Type: application/json' -d '{"username": "text", "email":"testemail", "password": "insecure"}' \
      -X POST http://localhost:3011/users/signup
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

    // TODO: Automatically login user and set session cookie
    ctx.redirect(ctx.request.header.origin);

  } catch (error) {
    throw new Error("Error creating user");
  }

});

// Login user and generate session cookie
router.post('/login', async (ctx) => {
  ctx.body = "Logged In";
});

// Logout user and remove session cookie
router.post('/logout', async (ctx) => {
  ctx.body = "Logged Out";
});

export default router;