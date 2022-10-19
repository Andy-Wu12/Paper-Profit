import Router from '@koa/router';

import Transaction from '../mongodb/models/transaction.js';

export const router = new Router({prefix: '/transaction'});

router.post('/buy', async (ctx) => {
  const queryDict = ctx.request.query;
  const postBody = ctx.request.body;

  const username = postBody.username;
  const symbol = queryDict.symbol;
  console.log(symbol);

  // Hardcode quantity for now
  const quantity = 1;

  try {
    if(queryDict === '{}') {
      throw new Error('Invalid request');
    }
    const transaction = new Transaction({username: username, symbol: symbol, quantity: quantity});
    transaction.save();

    ctx.status = 200;
    ctx.body = {message: 'Transaction successful', status: ctx.status};
    
  } catch(e) {
    ctx.status = 400;
    ctx.body = {message: 'Bad request', status: ctx.status}
  }

});

export default router;
