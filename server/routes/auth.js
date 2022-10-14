import bcrypt from 'bcrypt';
import Router from '@koa/router';
import { randomBytes } from 'crypto';
import mongoose from 'mongoose';

import User from '../mongodb/models/user.js';
import Session from '../mongodb/models/session.js';

export const router = new Router({prefix: '/auth'});
// Default is 10, but setting this variable allows for potential config.
const saltRounds = 10;

const sessionConfig = {
  httpOnly: true,
  expires: new Date(Date.now() + 8640000)
}

// Create user
router.post('/signup', async (ctx) => {
  /*
    ctx.request.body will only work with koaBody
    curl -H 'Content-Type: application/json' -d '{"username": "text", "email":"testemail", "password": "insecure"}' \
      -X POST http://localhost:3011/auth/signup
    should return {"username": "name"}
  */
  const postBody = ctx.request.body;
  const username = postBody.username;
  const email = postBody.email;
  const password = postBody.password;

  if(!(username && email && password)) {
    ctx.status = 400;
    ctx.body = {'message': 'Invalid form submission. Enter all required fields!'};
    return;
  }

  try {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = new User({username: username, email: email, password: hash});
    await newUser.save();

    // TODO: Automatically login user and set session cookie
    const sessionCookie = randomBytes(256).toString('hex');

    ctx.cookies.set('stocksim-sess', sessionCookie, sessionConfig);
    // Add session cookie to mongodb and associate with new user
    const session = new Session({userEmail: email, cookie: sessionCookie});
    session.save();
    
    // ctx.redirect(ctx.request.header.origin);
    ctx.body = {'message': 'Success'}
    ctx.status = 200;

  } catch (error) {
    ctx.status = 400;
    ctx.body = {'message': 'Error occurred when creating user'};
  }

});

// Login user and generate session cookie
router.post('/login', async (ctx) => {
  const postBody = ctx.request.body;
  const email = postBody.email;
  const password = postBody.password;

  if(!(email && password)) {
    ctx.status = 400;
    ctx.body = {'message': 'Invalid form submission'};
    return
  }

  try {
    // Check if email is valid
    const queryReturn = await User.findOne({email: email});
    // Check if password is valid


    if(!queryReturn) {
      ctx.body = {"message": "No user with that email exists!"};
    }
    else {
      // Set a new session cookie (and delete old one stored in db)
    }

    // queryReturn ? ctx.body = queryReturn : ctx.body = ctx.response;

    // ctx.redirect(ctx.request.header.origin);

  } catch(error) {
    throw new Error("Trouble logging in!");
  }
});

// Logout user and remove session cookie
router.post('/logout', async (ctx) => {
  ctx.body = "Logged Out";
});

export default router;