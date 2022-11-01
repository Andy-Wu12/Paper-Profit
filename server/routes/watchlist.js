import Router from '@koa/router';

import User from '../mongodb/models/user.js';
import Watchlist from '../mongodb/models/watchlist.js';

export const router = new Router({prefix: '/watchlist'});

router.post('/watch', async (ctx) => {
  const queryDict = ctx.request.query;
  const postBody = ctx.request.body;

  const username = postBody.username;
  const symbol = queryDict.symbol;

  try {
    if(!username || queryDict === '{}') {
      throw new Error('Invalid request');
    }

    // TODO: Handle watching an already watched stock
    await Watchlist.updateOne(
      {username: username},
      {$addToSet: {symbols: symbol }},
      {upsert: true}
    );

    ctx.status = 200;
    ctx.body = {message: `Added ${symbol} to watchlist!`, status: ctx.status};
    
  } catch(e) {
    ctx.status = 400;
    ctx.body = {message: e.message, status: ctx.status}
  }

});

export default router;
