import Router from '@koa/router';

import User from '../mongodb/models/user.js';
import Watchlist from '../mongodb/models/watchlist.js';
import { CustomContext } from '../typings/types.js';

export const router = new Router({prefix: '/watchlist'});

router.get('/user/:username', async(ctx: CustomContext) => {
  const username = ctx.params['username'];

  try {
    const list = await Watchlist.findOne({username: username});
    if(list) {
      ctx.status = 200;
      ctx.body = {message: list.symbols, status: ctx.status};
    }
    else { throw new Error(); }
  } catch (e) {
    ctx.status = 400;
    ctx.body = {message: "Error occurred", status: ctx.status};
  }
});

router.post('/watch', async (ctx: CustomContext) => {
  const queryDict = ctx.request.query;
  const postBody = ctx.request.body;

  const username = postBody.username;
  const symbol = queryDict.symbol;

  try {
    if(!username || !queryDict) {
      throw new Error('Invalid request');
    }

    await Watchlist.updateOne(
      {username: username},
      {$addToSet: {symbols: symbol }},
      {upsert: true}
    );

    ctx.status = 200;
    ctx.body = {message: `Added ${symbol} to watchlist!`, status: ctx.status};
    
  } catch(e) {
    ctx.status = 400;
    ctx.body = {message: "Error occurred trying to watch stock", status: ctx.status}
  }

});

router.post('/unwatch', async (ctx: CustomContext) => {
  const queryDict = ctx.request.query;
  const postBody = ctx.request.body;

  const username = postBody.username;
  const symbol = queryDict.symbol;

  try {
    if(!username || !queryDict) {
      throw new Error('Invalid request')
    }

    await Watchlist.updateOne(
      {username: username},
      { $pull: { 'symbols': symbol }}
    )

    ctx.status = 200;
    ctx.body = {message: 'Removed successfully', status: ctx.status};

  } catch (e) {
    ctx.status = 400;
    ctx.body = {message: "Error occurred trying to unwatch stock", status: ctx.status};
  }
})

export default router;
