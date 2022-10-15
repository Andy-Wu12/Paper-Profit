import bcrypt from 'bcrypt';
import Router from '@koa/router';
import { randomBytes } from 'crypto';

import User from '../mongodb/models/user.js';
import Session from '../mongodb/models/session.js';
import Auth from '../mongodb/models/auth.js';

export const router = new Router({prefix: '/auth'});

export const sessionCookieName = 'stocksim-sess';

// Default is 10, but setting this variable allows for potential config.
const saltRounds = 10;

const sessionConfig = {
  sameSite: 'lax',
  httpOnly: false,
  expires: new Date(Date.now() + 8640000)
};

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
    return;
  }

  try {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = new User({username: username, email: email});
    await newUser.save();

    const newAuth = new Auth({username: username, password: hash});
    await newAuth.save();

    // TODO: Automatically login user and set session cookie
    const cookie = await makeAndSaveSessionCookie(username);
    ctx.cookies.set('stocksim-sess', cookie, sessionConfig);

    ctx.status = 200;

  } catch (error) {
    ctx.status = 400;
  }

});

// Login user and generate session cookie
router.post('/login', async (ctx) => {
  const postBody = ctx.request.body;
  const username = postBody.username;
  const password = postBody.password;

  ctx.body = {};

  if(!(username && password)) {
    ctx.status = 400;
    ctx.body['message'] = 'Invalid form submission';
    return
  }
  
  try {
    // Check if email is valid
    const queryReturn = await Auth.findOne({username: username});
    if(!queryReturn) {
      ctx.status = 400;
      ctx.body['message'] = 'No user with that email exists!';
    }
    else {
      // Check if password is valid
      const response = await bcrypt.compare(password, queryReturn['password']);
      if(response) {
        // Set a new session cookie
        const cookie = await makeAndSaveSessionCookie(username);
        ctx.cookies.set('stocksim-sess', cookie, sessionConfig);
        ctx.body['message'] = 'Login success!';
      }
      else {
        ctx.status = 400;
        ctx.body['message'] = 'Incorrect credentials provided!';
      }
    }

  } catch(error) {
    ctx.status = 400;
    ctx.body['message'] = error.message;
  }
});

// Logout user and remove session cookie
router.post('/logout', async (ctx) => {
  const postBody = ctx.request.body;
  const username = postBody.username;
  
  ctx.body = {};

  if(!(username)) {
    ctx.status = 400;
    ctx.body['message'] = 'Invalid form submission';
    return;
  }
  
  try {
    const result = await Session.deleteOne({username: username});
    if(result.acknowledged && result.deletedCount == 1) {
      ctx.status = 200;
      ctx.body['message'] = 'Session deleted.';
    }
    else {
      ctx.status = 400;
      ctx.body['message'] = 'That user does not exist';
    }

  } catch(error) {
    ctx.status = 400;
    ctx.body['message'] = error.message;
  }

});


function generateSessionCookie() {
  return randomBytes(256).toString('hex');
}

async function makeAndSaveSessionCookie(username) {
  const sessionCookie = generateSessionCookie();
  // const session = new Session({username: username, cookie: sessionCookie});
  await Session.updateOne(
    {username: username},
    {cookie: sessionCookie},
    {upsert: true}
  );

  return sessionCookie;
}

export default router;